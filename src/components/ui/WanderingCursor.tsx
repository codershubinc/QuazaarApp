import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, useWindowDimensions, DeviceEventEmitter } from 'react-native';
import Svg, { G, Line, Circle, Rect, Defs, RadialGradient, Stop } from 'react-native-svg';

// Physics constants
const TRAIL_LEN = 42;
const SPINE_N = 12, SPINE_SEG = 13, ARM_N = 3, ARM_SEG = 9, LEG_N = 3, LEG_SEG = 11, SHOULDER = 2, HIP = SPINE_N - 3;
const COLORS = ['#4285F4', '#EA4335', '#FBBC04', '#34A853'];
const DARK = '#0a0a0f';

// Helpers
function _mkChain(n: number) { return Array.from({ length: n }, () => ({ x: -600, y: -600 })); }
function _lerp(j: any, tx: number, ty: number, f: number) { j.x += (tx - j.x) * f; j.y += (ty - j.y) * f; }
function _pull(joint: any, anchor: any, len: number) {
    const dx = joint.x - anchor.x;
    const dy = joint.y - anchor.y;
    const d = Math.hypot(dx, dy) || 0.001;
    joint.x = anchor.x + (dx / d) * len;
    joint.y = anchor.y + (dy / d) * len;
}
function _branch(limb: any[], anchor: any, behind: any, side: number, seg: number) {
    const angle = Math.atan2(anchor.y - behind.y, anchor.x - behind.x) + (Math.PI / 2) * side;
    _lerp(limb[0], anchor.x + Math.cos(angle) * seg * 0.65, anchor.y + Math.sin(angle) * seg * 0.65, 0.32);
    for (let i = 1; i < limb.length; i++) _pull(limb[i], limb[i - 1], seg);
}
function _a(v: number) { return Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0'); }
function _nextBlinkWait() { return Math.round((300 + Math.random() * 200) / 1000 * 60); }
function _pickBlinkSeq() {
    const CLOSE = 4, GAP = 5, roll = Math.random();
    if (roll < 0.40) return [CLOSE];
    if (roll < 0.65) return [CLOSE, GAP, CLOSE];
    if (roll < 0.82) return [CLOSE, GAP, CLOSE, GAP, CLOSE];
    return [3, 3, 3, 3, 3, 3, 3];
}

class LaserTail {
    _pts: { x: number, y: number }[] = [];
    update(x: number, y: number) {
        this._pts.push({ x, y });
        if (this._pts.length > TRAIL_LEN) this._pts.shift();
    }
}

class RoboSkeleton {
    spine = _mkChain(SPINE_N);
    armL = _mkChain(ARM_N);
    armR = _mkChain(ARM_N);
    legL = _mkChain(LEG_N);
    legR = _mkChain(LEG_N);
    _eyeOpen = true; _blinkTick = 0; _blinkSeq: number[] = []; _blinkSeqIdx = 0;
    _blinkWait = _nextBlinkWait();

    update(mx: number, my: number) {
        _lerp(this.spine[0], mx, my, 0.25);
        for (let i = 1; i < SPINE_N; i++) _pull(this.spine[i], this.spine[i - 1], SPINE_SEG);
        _branch(this.armL, this.spine[SHOULDER], this.spine[SHOULDER + 1], -1, ARM_SEG);
        _branch(this.armR, this.spine[SHOULDER], this.spine[SHOULDER + 1], 1, ARM_SEG);
        _branch(this.legL, this.spine[HIP], this.spine[HIP - 1], -1, LEG_SEG);
        _branch(this.legR, this.spine[HIP], this.spine[HIP - 1], 1, LEG_SEG);
        this._blinkTick++;
        if (this._blinkSeq.length === 0) {
            if (this._blinkTick >= this._blinkWait) {
                this._blinkTick = 0; this._blinkSeq = _pickBlinkSeq(); this._blinkSeqIdx = 0;
            }
        } else {
            const dur = this._blinkSeq[this._blinkSeqIdx];
            if (this._blinkTick >= dur) {
                this._blinkTick = 0; this._blinkSeqIdx++;
                if (this._blinkSeqIdx >= this._blinkSeq.length) {
                    this._eyeOpen = true; this._blinkSeq = []; this._blinkWait = _nextBlinkWait();
                } else { this._eyeOpen = !this._eyeOpen; }
            }
        }
    }
}

/* Rendering Primitives */
const Bone = ({ a, b, bw, color, alpha }: any) => {
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (len < 1) return null;
    const deg = Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI);
    return (
        <G x={a.x} y={a.y} rotation={deg} originX={0} originY={0}>
            <Rect x={1} y={-bw * 0.5} width={len - 2} height={bw} rx={bw * 0.42} fill={color + _a(alpha * 0.18)} stroke={color + _a(alpha * 0.85)} strokeWidth={1.2} />
            {len > bw * 2 && <Line x1={bw * 0.65} y1={0} x2={len - bw * 0.65} y2={0} stroke={color + _a(alpha * 0.38)} strokeWidth={0.7} />}
            {len > 14 && (
                <>
                    <Circle cx={len * 0.3} cy={0} r={1.15} fill={color + _a(alpha * 0.65)} />
                    <Circle cx={len * 0.7} cy={0} r={1.15} fill={color + _a(alpha * 0.65)} />
                </>
            )}
        </G>
    );
};

const JointDot = ({ p, r, color, alpha }: any) => (
    <G x={p.x} y={p.y}>
        <Circle cx={0} cy={0} r={r} fill={color + _a(alpha * 0.28)} stroke={color + _a(alpha)} strokeWidth={1.3} />
        <Circle cx={0} cy={0} r={r * 0.35} fill={color + _a(alpha * 0.85)} />
        <Circle cx={0} cy={0} r={r * 0.15} fill={DARK} />
    </G>
);

const SkeletonChain = ({ joints, aBase, wBase, colorOffset }: any) => {
    const n = joints.length;
    const res: any[] = [];
    for (let i = 0; i < n - 1; i++) {
        const t = 1 - i / Math.max(n - 2, 1);
        res.push(<Bone key={`cb_${colorOffset}_${i}`} a={joints[i]} b={joints[i + 1]} bw={wBase * (0.55 + t * 0.45)} color={COLORS[(i + colorOffset) % 4]} alpha={aBase * (0.45 + t * 0.55)} />);
    }
    for (let i = 0; i < n; i++) {
        const t = 1 - i / (n - 1);
        res.push(<JointDot key={`cj_${colorOffset}_${i}`} p={joints[i]} r={1.3 + t * 2.5} color={COLORS[(i + colorOffset) % 4]} alpha={aBase * (0.45 + t * 0.55)} />);
    }
    return <>{res}</>;
};

const SkeletonSpine = ({ s }: any) => {
    const res: any[] = [];
    for (let i = SPINE_N - 2; i >= 0; i--) {
        const t = 1 - i / (SPINE_N - 2);
        res.push(<Bone key={`sb_${i}`} a={s[i]} b={s[i + 1]} bw={2.5 + t * 6.5} color={COLORS[i % 4]} alpha={0.18 + t * 0.72} />);
    }
    for (let i = SPINE_N - 1; i >= 1; i--) {
        const t = 1 - i / (SPINE_N - 1);
        res.push(<JointDot key={`sj_${i}`} p={s[i]} r={1.4 + t * 3.5} color={COLORS[i % 4]} alpha={0.18 + t * 0.72} />);
    }
    return <>{res}</>;
};

const Head = ({ pos, eyeOpen }: { pos: any, eyeOpen: boolean }) => {
    const W = 30, H = 24, R = 7;
    const ty = -H / 2 - 16;
    const ey = -1;
    return (
        <G x={pos.x} y={pos.y}>
            <Rect x={-W / 2} y={-H / 2} width={W} height={H} rx={R} fill="rgba(18,18,28,0.93)" stroke={COLORS[0] + 'cc'} strokeWidth={2} />
            <Line x1={0} y1={-H / 2} x2={0} y2={-H / 2 - 13} stroke={COLORS[0] + '88'} strokeWidth={1.5} />

            <Circle cx={0} cy={ty} r={8} fill="url(#antennaGlow)" />
            <Circle cx={0} cy={ty} r={3} fill={COLORS[1]} />

            {[[-7.5, COLORS[0]], [7.5, COLORS[2]]].map(([ex, col], i) => (
                <G x={ex as number} y={ey} key={`eye_${i}`}>
                    <Circle cx={0} cy={0} r={5.5} fill="rgba(0,0,0,0.55)" />
                    {eyeOpen ? (
                        <>
                            <Circle cx={0} cy={0} r={6.5} fill={col + '28'} />
                            <Circle cx={0} cy={0} r={3.8} fill={col as string} />
                            <Circle cx={0} cy={0} r={1.6} fill={DARK} />
                            <Circle cx={-1.1} cy={-1.1} r={0.9} fill="rgba(255,255,255,0.85)" />
                        </>
                    ) : (
                        <Line x1={-3.8} y1={0} x2={3.8} y2={0} stroke={col as string} strokeWidth={2.2} />
                    )}
                </G>
            ))}

            {[0, 1, 2].map(i => {
                const gx = -4.5 + i * 4.5;
                return <Line key={`grill_${i}`} x1={gx} y1={H / 2 - 8} x2={gx} y2={H / 2 - 3} stroke={COLORS[2] + '66'} strokeWidth={1.5} />
            })}
        </G>
    );
};

const LaserLines = ({ pts }: { pts: { x: number, y: number }[] }) => {
    if (pts.length < 2) return null;
    const res: any[] = [];
    const n = pts.length;
    for (let i = 1; i < n; i++) {
        const a = Math.pow(i / (n - 1), 2);
        const p0 = pts[i - 1], p1 = pts[i];
        res.push(<Line key={`l1_${i}`} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke={`rgba(66,133,244,${+(a * 0.12).toFixed(3)})`} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" />);
        res.push(<Line key={`l2_${i}`} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke={`rgba(100,180,255,${+(a * 0.36).toFixed(3)})`} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />);
        res.push(<Line key={`l3_${i}`} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke={`rgba(210,238,255,${+(a * 0.88).toFixed(3)})`} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />);
    }
    const tip = pts[n - 1];
    res.push(<Circle key="tip" cx={tip.x} cy={tip.y} r={10} fill="url(#laserTip)" />);
    return <>{res}</>;
};

export const WanderingCursor = () => {
    const { width, height } = useWindowDimensions();
    const [, setTick] = useState(0);
    const [zIndex, setZIndex] = useState(5);
    const [visible, setVisible] = useState(false);

    const visibleRef = useRef(false);
    const rafRef = useRef<number>(0);
    const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const inst = useRef({
        skeleton: new RoboSkeleton(),
        laser: new LaserTail(),
        mx: -600,
        my: -600,
        targetX: width / 2,
        targetY: height / 2,
        speed: 0.03,
        stayUntil: 0,
        stayAnchorX: 0,
        stayAnchorY: 0,
        fidgetTime: 0,
        hideAt: 0,
        nextTargetTime: 0,
        exiting: false,
        exitTargetX: 0,
        exitTargetY: 0,
    }).current;

    const show = () => { visibleRef.current = true; setVisible(true); };
    const hide = () => { visibleRef.current = false; setVisible(false); };

    // Pick a random off-screen exit point along one of the 4 edges
    const pickExitTarget = React.useCallback(() => {
        const MARGIN = 250;
        const edge = Math.floor(Math.random() * 4);
        if (edge === 0) return { x: Math.random() * width, y: -MARGIN };         // top
        if (edge === 1) return { x: Math.random() * width, y: height + MARGIN };  // bottom
        if (edge === 2) return { x: -MARGIN, y: Math.random() * height };         // left
        return { x: width + MARGIN, y: Math.random() * height };          // right
    }, [width, height]);

    // Start the animation loop — runs until hideAt
    const startLoop = React.useCallback(() => {
        cancelAnimationFrame(rafRef.current);
        if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);

        const loop = () => {
            const now = Date.now();

            // Trigger exit dash once hideAt is reached
            if (!inst.exiting && now >= inst.hideAt) {
                inst.exiting = true;
                const exit = pickExitTarget();
                inst.exitTargetX = exit.x;
                inst.exitTargetY = exit.y;
                inst.speed = 0.09;
            }

            // While exiting: steer toward off-screen target; hide once fully gone
            if (inst.exiting) {
                inst.targetX = inst.exitTargetX;
                inst.targetY = inst.exitTargetY;
                inst.mx += (inst.targetX - inst.mx) * inst.speed;
                inst.my += (inst.targetY - inst.my) * inst.speed;
                inst.skeleton.update(inst.mx, inst.my);
                const tail = inst.skeleton.spine[inst.skeleton.spine.length - 1];
                inst.laser.update(tail.x, tail.y);
                setTick(t => t + 1);
                const MARGIN = 200;
                if (inst.mx < -MARGIN || inst.mx > width + MARGIN || inst.my < -MARGIN || inst.my > height + MARGIN) {
                    inst.exiting = false;
                    // Clear laser trail so next appearance starts clean
                    inst.laser._pts = [];
                    hide();
                    sleepTimerRef.current = setTimeout(randomWakeup, 30000 + Math.random() * 40000);
                } else {
                    rafRef.current = requestAnimationFrame(loop);
                }
                return;
            }

            if (now < inst.stayUntil) {
                // Fidget around the touch anchor
                if (now > inst.fidgetTime) {
                    const r = 25 + Math.random() * 40;
                    const angle = Math.random() * Math.PI * 2;
                    inst.targetX = inst.stayAnchorX + Math.cos(angle) * r;
                    inst.targetY = inst.stayAnchorY + Math.sin(angle) * r;
                    inst.speed = 0.025;
                    inst.fidgetTime = now + 600 + Math.random() * 700;
                }
            } else if (now > inst.nextTargetTime) {
                // Wander slowly — small moves, long pauses
                const range = Math.min(width, height) * 0.35;
                inst.targetX = inst.stayAnchorX + (Math.random() - 0.5) * range * 2;
                inst.targetY = inst.stayAnchorY + (Math.random() - 0.5) * range * 2;
                inst.speed = 0.008 + Math.random() * 0.02; // slower drift
                inst.nextTargetTime = now + 2500 + Math.random() * 4000; // longer pauses
            }

            inst.mx += (inst.targetX - inst.mx) * inst.speed;
            inst.my += (inst.targetY - inst.my) * inst.speed;

            inst.skeleton.update(inst.mx, inst.my);
            const tail = inst.skeleton.spine[inst.skeleton.spine.length - 1];
            inst.laser.update(tail.x, tail.y);

            setTick(t => t + 1);
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [width, height, pickExitTarget]);

    const randomWakeup = React.useCallback(() => {
        // Appear at a random on-screen location
        inst.mx = width * 0.15 + Math.random() * width * 0.7;
        inst.my = height * 0.15 + Math.random() * height * 0.7;
        inst.targetX = inst.mx;
        inst.targetY = inst.my;
        inst.stayAnchorX = inst.mx;
        inst.stayAnchorY = inst.my;
        inst.stayUntil = 0;
        inst.nextTargetTime = Date.now();
        inst.hideAt = Date.now() + 4000 + Math.random() * 4000; // visible 4–8s
        show();
        startLoop();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [width, height, startLoop]);

    useEffect(() => {
        const touchSub = DeviceEventEmitter.addListener('WANDERING_CURSOR_TOUCH', (data) => {
            // Teleport skeleton head to touch point instantly
            inst.mx = data.x;
            inst.my = data.y;
            inst.targetX = data.x;
            inst.targetY = data.y;
            inst.stayAnchorX = data.x;
            inst.stayAnchorY = data.y;
            inst.speed = 0.12;
            inst.stayUntil = Date.now() + 3000;
            inst.fidgetTime = Date.now() + 600;
            inst.nextTargetTime = inst.stayUntil;
            inst.hideAt = Date.now() + 7000; // visible ~7s after touch
            show();
            startLoop();
        });

        const zInterval = setInterval(() => {
            if (visibleRef.current) {
                const options = [1, 10];
                setZIndex(options[Math.floor(Math.random() * options.length)]);
            }
        }, 4500);

        // First random wakeup after 15–30s so it doesn't pop up immediately on launch
        sleepTimerRef.current = setTimeout(randomWakeup, 15000 + Math.random() * 15000);

        return () => {
            touchSub.remove();
            cancelAnimationFrame(rafRef.current);
            clearInterval(zInterval);
            if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
        };
    }, [width, height, startLoop, randomWakeup]);

    if (!visible) return null;

    return (
        <View style={[styles.container, { zIndex, elevation: zIndex }]} pointerEvents="none">
            <Svg style={StyleSheet.absoluteFill}>
                <Defs>
                    <RadialGradient id="laserTip" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
                        <Stop offset="0%" stopColor="rgba(200,228,255,0.72)" />
                        <Stop offset="100%" stopColor="rgba(66,133,244,0)" />
                    </RadialGradient>
                    <RadialGradient id="antennaGlow" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
                        <Stop offset="0%" stopColor={COLORS[1] + 'bb'} />
                        <Stop offset="100%" stopColor={COLORS[1] + '00'} />
                    </RadialGradient>
                </Defs>

                <LaserLines pts={inst.laser._pts} />
                <SkeletonChain joints={inst.skeleton.legL} aBase={0.42} wBase={4.0} colorOffset={1} />
                <SkeletonChain joints={inst.skeleton.legR} aBase={0.42} wBase={4.0} colorOffset={2} />
                <SkeletonSpine s={inst.skeleton.spine} />
                <SkeletonChain joints={inst.skeleton.armL} aBase={0.60} wBase={5.0} colorOffset={0} />
                <SkeletonChain joints={inst.skeleton.armR} aBase={0.60} wBase={5.0} colorOffset={1} />
                <Head pos={inst.skeleton.spine[0]} eyeOpen={inst.skeleton._eyeOpen} />
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
    }
});
