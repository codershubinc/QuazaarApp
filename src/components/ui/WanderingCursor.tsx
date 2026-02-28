import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, useWindowDimensions, DeviceEventEmitter } from 'react-native';
import Svg, { Line, Circle, Defs, RadialGradient, Stop, Text as SvgText, Polygon, Rect, G } from 'react-native-svg';
import { useAppStore } from '../../store/useAppStore';

// Import Buddies
import { BotBuddy } from '../buddy/BotBuddy';
import { IronManBuddy } from '../buddy/IronManBuddy';

// Physics
const TRAIL_LEN = 30; // Slightly shorter trails for 4 lasers to improve performance
const SPINE_N = 12, SPINE_SEG = 13, ARM_N = 3, ARM_SEG = 16, LEG_N = 3, LEG_SEG = 20, SHOULDER = 2, HIP = SPINE_N - 3;
const COLORS = ['#4285F4', '#EA4335', '#FBBC04', '#34A853'];
const IRONMAN_COLORS = ['#B22222', '#CC2200', '#FFD700', '#FF4400'];

// --- Helpers ---
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
    const shoulderOffsetX = anchor.x + Math.cos(angle) * seg * 0.8;
    const shoulderOffsetY = anchor.y + Math.sin(angle) * seg * 0.8;
    _lerp(limb[0], shoulderOffsetX, shoulderOffsetY, 0.4);
    for (let i = 1; i < limb.length; i++) _pull(limb[i], limb[i - 1], seg);
}

function _nextBlinkWait() { return Math.round((300 + Math.random() * 200) / 1000 * 60); }
function _pickBlinkSeq() {
    const CLOSE = 4, GAP = 5, roll = Math.random();
    if (roll < 0.40) return [CLOSE];
    if (roll < 0.65) return [CLOSE, GAP, CLOSE];
    return [CLOSE, GAP, CLOSE, GAP, CLOSE];
}

// --- Classes ---
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
    waving = false;
    waveAngle = 0;

    update(mx: number, my: number) {
        _lerp(this.spine[0], mx, my, 0.25);
        for (let i = 1; i < SPINE_N; i++) _pull(this.spine[i], this.spine[i - 1], SPINE_SEG);

        _branch(this.armL, this.spine[SHOULDER], this.spine[SHOULDER + 1], -1, ARM_SEG);

        if (!this.waving) {
            _branch(this.armR, this.spine[SHOULDER], this.spine[SHOULDER + 1], 1, ARM_SEG);
        } else {
            const sh = this.spine[SHOULDER];
            const w = Math.sin(this.waveAngle);
            this.armR[0].x += (sh.x + ARM_SEG * 0.9 - this.armR[0].x) * 0.18;
            this.armR[0].y += (sh.y - ARM_SEG * 1.2 - this.armR[0].y) * 0.18;
            this.armR[1].x += (sh.x + ARM_SEG * 1.4 - this.armR[1].x) * 0.15;
            this.armR[1].y += (sh.y - ARM_SEG * 2.5 + w * 9 - this.armR[1].y) * 0.15;
            this.armR[2].x += (sh.x + ARM_SEG * 0.9 - this.armR[2].x) * 0.12;
            this.armR[2].y += (sh.y - ARM_SEG * 3.5 + w * 16 - this.armR[2].y) * 0.12;
            this.waveAngle += 0.22;
        }

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

// Updated to accept custom colors (for Blue/White Iron Man beams)
const LaserLines = ({ pts, colorR, colorG, colorB }: { pts: { x: number, y: number }[], colorR?: number, colorG?: number, colorB?: number }) => {
    if (pts.length < 2) return null;
    const res: any[] = [];
    const n = pts.length;

    // Default to Blue if no color provided
    const R = colorR ?? 66;
    const G = colorG ?? 133;
    const B = colorB ?? 244;

    for (let i = 1; i < n; i++) {
        const a = Math.pow(i / (n - 1), 2);
        const p0 = pts[i - 1], p1 = pts[i];

        // Inner Core (Bright)
        res.push(<Line key={`l1_${i}`} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke={`rgba(${R},${G},${B},${+(a * 0.12).toFixed(3)})`} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" />);
        // Mid Glow
        res.push(<Line key={`l2_${i}`} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke={`rgba(${Math.min(R + 40, 255)},${Math.min(G + 50, 255)},${Math.min(B + 10, 255)},${+(a * 0.36).toFixed(3)})`} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />);
        // White Hot Center
        res.push(<Line key={`l3_${i}`} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke={`rgba(230,245,255,${+(a * 0.88).toFixed(3)})`} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />);
    }
    const tip = pts[n - 1];
    res.push(<Circle key="tip" cx={tip.x} cy={tip.y} r={10} fill="url(#laserTip)" />);
    return <>{res}</>;
};

const SpeechBubble = ({ pos, text }: { pos: { x: number; y: number }; text: string }) => {
    const padX = 10, padY = 5;
    const bubbleW = Math.max(text.length * 7.2 + padX * 2, 72);
    const bubbleH = 28;
    const bx = pos.x - bubbleW / 2;
    const by = pos.y - 76 - bubbleH;
    const tailBaseY = by + bubbleH;
    const tailTipY = pos.y - 60;
    return (
        <G>
            <Rect x={bx} y={by} width={bubbleW} height={bubbleH} rx={8}
                fill="rgba(12,12,22,0.95)" stroke="#4285F4cc" strokeWidth={1.5} />
            <Polygon points={`${pos.x - 5},${tailBaseY} ${pos.x + 5},${tailBaseY} ${pos.x},${tailTipY}`} fill="rgba(12,12,22,0.95)" />
            <SvgText x={pos.x} y={by + padY + 14} textAnchor="middle" fill="#ffffff" fontSize={12} fontWeight="bold">{text}</SvgText>
        </G>
    );
};

export const WanderingCursor = () => {
    const { width, height } = useWindowDimensions();
    const buddyType = useAppStore(s => s.buddyType);
    const activeColors = buddyType === 'ironman' ? IRONMAN_COLORS : COLORS;
    const [, setTick] = useState(0);
    const [visible, setVisible] = useState(false);
    const [showBubble, setShowBubble] = useState(false);

    const visibleRef = useRef(false);
    const rafRef = useRef<number>(0);
    const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const inst = useRef({
        skeleton: new RoboSkeleton(),
        // Multiple laser instances for Iron Man
        laserMain: new LaserTail(),
        laserHandL: new LaserTail(),
        laserHandR: new LaserTail(),
        laserFootL: new LaserTail(),
        laserFootR: new LaserTail(),

        mx: -600, my: -600,
        targetX: width / 2, targetY: height / 2,
        speed: 0.03,
        stayUntil: 0, stayAnchorX: 0, stayAnchorY: 0,
        fidgetTime: 0, hideAt: 0, nextTargetTime: 0,
        exiting: false, exitTargetX: 0, exitTargetY: 0,
        patternType: 'random' as 'random' | 'circle' | 'figure8' | 'patrol',
        patternT: 0, patternCx: 0, patternCy: 0, patternR: 80,
        greeting: false, greetEndTime: 0, bubbleText: 'Hello! 👋',
    }).current;

    const show = () => { visibleRef.current = true; setVisible(true); };
    const hide = () => { visibleRef.current = false; setVisible(false); };

    const startLoop = React.useCallback(() => {
        cancelAnimationFrame(rafRef.current);
        if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);

        const loop = () => {
            const now = Date.now();

            if (!inst.exiting && now >= inst.hideAt) {
                inst.exiting = true;
                const edge = Math.floor(Math.random() * 4);
                if (edge === 0) { inst.exitTargetX = Math.random() * width; inst.exitTargetY = -250; }
                else if (edge === 1) { inst.exitTargetX = Math.random() * width; inst.exitTargetY = height + 250; }
                else if (edge === 2) { inst.exitTargetX = -250; inst.exitTargetY = Math.random() * height; }
                else { inst.exitTargetX = width + 250; inst.exitTargetY = Math.random() * height; }
                inst.speed = 0.09;
            }

            if (inst.exiting) {
                inst.targetX = inst.exitTargetX;
                inst.targetY = inst.exitTargetY;
                inst.mx += (inst.targetX - inst.mx) * inst.speed;
                inst.my += (inst.targetY - inst.my) * inst.speed;
                inst.skeleton.update(inst.mx, inst.my);

                // Update appropriate lasers based on type
                if (buddyType === 'ironman') {
                    const hL = inst.skeleton.armL[inst.skeleton.armL.length - 1];
                    const hR = inst.skeleton.armR[inst.skeleton.armR.length - 1];
                    const fL = inst.skeleton.legL[inst.skeleton.legL.length - 1];
                    const fR = inst.skeleton.legR[inst.skeleton.legR.length - 1];
                    inst.laserHandL.update(hL.x, hL.y);
                    inst.laserHandR.update(hR.x, hR.y);
                    inst.laserFootL.update(fL.x, fL.y);
                    inst.laserFootR.update(fR.x, fR.y);
                } else {
                    const tail = inst.skeleton.spine[inst.skeleton.spine.length - 1];
                    inst.laserMain.update(tail.x, tail.y);
                }

                setTick(t => t + 1);

                if (inst.mx < -300 || inst.mx > width + 300 || inst.my < -300 || inst.my > height + 300) {
                    inst.exiting = false;
                    // Reset all
                    inst.laserMain._pts = [];
                    inst.laserHandL._pts = []; inst.laserHandR._pts = [];
                    inst.laserFootL._pts = []; inst.laserFootR._pts = [];
                    hide();
                    sleepTimerRef.current = setTimeout(randomWakeup, 30000 + Math.random() * 40000);
                } else {
                    rafRef.current = requestAnimationFrame(loop);
                }
                return;
            }

            // Normal Movement
            if (now < inst.stayUntil) {
                if (now > inst.fidgetTime) {
                    const r = 25 + Math.random() * 40;
                    const angle = Math.random() * Math.PI * 2;
                    inst.targetX = inst.stayAnchorX + Math.cos(angle) * r;
                    inst.targetY = inst.stayAnchorY + Math.sin(angle) * r;
                    inst.speed = 0.025;
                    inst.fidgetTime = now + 600 + Math.random() * 700;
                }
            } else if (inst.patternType !== 'random') {
                const dt = inst.patternType === 'patrol' ? 0.011 : inst.patternType === 'figure8' ? 0.013 : 0.016;
                inst.patternT += dt;
                const t = inst.patternT;
                if (inst.patternType === 'circle') {
                    inst.targetX = inst.patternCx + inst.patternR * Math.cos(t);
                    inst.targetY = inst.patternCy + inst.patternR * 0.55 * Math.sin(t);
                } else if (inst.patternType === 'figure8') {
                    inst.targetX = inst.patternCx + inst.patternR * Math.sin(t);
                    inst.targetY = inst.patternCy + inst.patternR * 0.4 * Math.sin(2 * t);
                } else {
                    inst.targetX = inst.patternCx + inst.patternR * 1.6 * Math.cos(t);
                    inst.targetY = inst.patternCy + 22 * Math.sin(t * 2.7);
                }
                inst.speed = 0.055;
            } else if (now > inst.nextTargetTime) {
                const range = Math.min(width, height) * 0.32;
                inst.targetX = inst.stayAnchorX + (Math.random() - 0.5) * range * 2;
                inst.targetY = inst.stayAnchorY + (Math.random() - 0.5) * range * 2;
                inst.speed = 0.008 + Math.random() * 0.018;
                inst.nextTargetTime = now + 3000 + Math.random() * 4000;
            }

            if (inst.greeting && now > inst.greetEndTime) {
                inst.greeting = false;
                inst.skeleton.waving = false;
                setShowBubble(false);
            }

            inst.mx += (inst.targetX - inst.mx) * inst.speed;
            inst.my += (inst.targetY - inst.my) * inst.speed;

            inst.skeleton.update(inst.mx, inst.my);

            // Update Lasers
            if (buddyType === 'ironman') {
                const hL = inst.skeleton.armL[inst.skeleton.armL.length - 1];
                const hR = inst.skeleton.armR[inst.skeleton.armR.length - 1];
                const fL = inst.skeleton.legL[inst.skeleton.legL.length - 1];
                const fR = inst.skeleton.legR[inst.skeleton.legR.length - 1];
                inst.laserHandL.update(hL.x, hL.y);
                inst.laserHandR.update(hR.x, hR.y);
                inst.laserFootL.update(fL.x, fL.y);
                inst.laserFootR.update(fR.x, fR.y);
            } else {
                const tail = inst.skeleton.spine[inst.skeleton.spine.length - 1];
                inst.laserMain.update(tail.x, tail.y);
            }

            setTick(t => t + 1);
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
    }, [width, height, buddyType]);

    const randomWakeup = React.useCallback(() => {
        inst.mx = width * 0.15 + Math.random() * width * 0.7;
        inst.my = height * 0.15 + Math.random() * height * 0.7;
        inst.targetX = inst.mx;
        inst.targetY = inst.my;
        inst.stayAnchorX = inst.mx;
        inst.stayAnchorY = inst.my;
        inst.stayUntil = 0;

        const patterns = ['random', 'circle', 'figure8', 'patrol'] as const;
        inst.patternType = patterns[Math.floor(Math.random() * patterns.length)];
        inst.patternT = Math.random() * Math.PI * 2;
        inst.patternCx = inst.mx;
        inst.patternCy = inst.my;
        inst.patternR = 55 + Math.random() * 80;
        inst.nextTargetTime = Date.now();

        if (Math.random() < 0.35) {
            const greetings = ['Hello! 👋', 'Hi there! 👋', 'Hey! 👋', 'Boo! 👻', 'Sup? 🤖'];
            inst.bubbleText = greetings[Math.floor(Math.random() * greetings.length)];
            inst.greeting = true;
            inst.greetEndTime = Date.now() + 3200;
            inst.skeleton.waving = true;
            setShowBubble(true);
        }

        inst.exiting = false;
        inst.hideAt = Date.now() + 8000 + Math.random() * 7000;
        show();
        startLoop();
    }, [width, height, startLoop]);

    useEffect(() => {
        const touchSub = DeviceEventEmitter.addListener('WANDERING_CURSOR_TOUCH', (data) => {
            inst.mx = data.x; inst.my = data.y;
            inst.targetX = data.x; inst.targetY = data.y;
            inst.stayAnchorX = data.x; inst.stayAnchorY = data.y;
            inst.speed = 0.12;
            inst.exiting = false;                        // cancel any exit dash
            inst.stayUntil = Date.now() + 5000;          // stay near touch for 5s
            inst.fidgetTime = Date.now() + 600;
            inst.nextTargetTime = inst.stayUntil;
            inst.hideAt = Date.now() + 18000;            // stay visible ~18s after tap
            inst.skeleton.waving = false;
            inst.greeting = false;
            inst.patternType = 'random';
            setShowBubble(false);
            show();
            startLoop();
        });

        sleepTimerRef.current = setTimeout(randomWakeup, 15000 + Math.random() * 15000);

        return () => {
            touchSub.remove();
            cancelAnimationFrame(rafRef.current);
            if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
        };
    }, [width, height, startLoop, randomWakeup]);

    if (!visible) return null;

    return (
        <View style={[styles.container, { zIndex: 100, elevation: 100 }]} pointerEvents="none">
            <Svg style={StyleSheet.absoluteFill}>
                <Defs>
                    <RadialGradient id="laserTip" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
                        <Stop offset="0%" stopColor={buddyType === 'ironman' ? 'rgba(0,240,255,0.72)' : 'rgba(200,228,255,0.72)'} />
                        <Stop offset="100%" stopColor={buddyType === 'ironman' ? 'rgba(0,240,255,0)' : 'rgba(66,133,244,0)'} />
                    </RadialGradient>
                    <RadialGradient id="antennaGlow" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
                        <Stop offset="0%" stopColor={activeColors[1] + 'bb'} />
                        <Stop offset="100%" stopColor={activeColors[1] + '00'} />
                    </RadialGradient>
                    <RadialGradient id="eyeGlow" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
                        <Stop offset="0%" stopColor="rgba(255,255,180,0.95)" />
                        <Stop offset="100%" stopColor="rgba(255,200,0,0.4)" />
                    </RadialGradient>
                </Defs>

                {buddyType === 'ironman' ? (
                    <>
                        {/* 4 Lasers for Iron Man - Cyan/White color scheme */}
                        <LaserLines pts={inst.laserHandL._pts} colorR={0} colorG={220} colorB={255} />
                        <LaserLines pts={inst.laserHandR._pts} colorR={0} colorG={220} colorB={255} />
                        <LaserLines pts={inst.laserFootL._pts} colorR={0} colorG={220} colorB={255} />
                        <LaserLines pts={inst.laserFootR._pts} colorR={0} colorG={220} colorB={255} />
                        <IronManBuddy skeleton={inst.skeleton} />
                    </>
                ) : (
                    <>
                        <LaserLines pts={inst.laserMain._pts} />
                        <BotBuddy skeleton={inst.skeleton} />
                    </>
                )}

                {showBubble && <SpeechBubble pos={inst.skeleton.spine[0]} text={inst.bubbleText} />}
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