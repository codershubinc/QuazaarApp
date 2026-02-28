import React from 'react';
import { G, Rect, Line, Circle } from 'react-native-svg';

// --- Shared Helpers ---
const _a = (v: number) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0');
const COLORS = ['#4285F4', '#EA4335', '#FBBC04', '#34A853'];
const DARK = '#0a0a0f';

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
    const SPINE_N = s.length;
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

export const BotBuddy = ({ skeleton }: { skeleton: any }) => {
    return (
        <>
            <SkeletonChain joints={skeleton.legL} aBase={0.42} wBase={4.0} colorOffset={1} />
            <SkeletonChain joints={skeleton.legR} aBase={0.42} wBase={4.0} colorOffset={2} />
            <SkeletonSpine s={skeleton.spine} />
            <SkeletonChain joints={skeleton.armL} aBase={0.60} wBase={5.0} colorOffset={0} />
            <SkeletonChain joints={skeleton.armR} aBase={0.60} wBase={5.0} colorOffset={1} />
            <Head pos={skeleton.spine[0]} eyeOpen={skeleton._eyeOpen} />
        </>
    );
};