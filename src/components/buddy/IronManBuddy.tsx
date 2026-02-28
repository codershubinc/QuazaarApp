import React from 'react';
import { G, Line, Circle, Path, Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';

// — Iron Man Mark VII Color Palette —
const RED_DARK = "#7A0000";
const RED_MID = "#B91C1C";
const RED_MAIN = "#DC2626";
const GOLD_DARK = "#92400E";
const GOLD_MID = "#B45309";
const GOLD_MAIN = "#FBBF24";
const GOLD_LIGHT = "#FDE68A";
const ARC = "#00F0FF";   // Arc reactor / repulsor cyan

// — Armor plate drawn between two joints with width taper —
const ArmorPlate = ({ a, b, w0, w1, fill, stroke, highlightOpacity = 0.25 }: any) => {
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (len < 1) return null;
    const deg = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    return (
        <G x={a.x} y={a.y} rotation={deg} originX={0} originY={0}>
            <Path
                d={`M 0 ${-w0 / 2} L ${len} ${-w1 / 2} L ${len} ${w1 / 2} L 0 ${w0 / 2} Z`}
                fill={fill}
                stroke={stroke || RED_DARK}
                strokeWidth={1.3}
            />
            <Line x1={2} y1={-w0 / 2 + 1.8} x2={len - 2} y2={-w1 / 2 + 1.8}
                stroke={`rgba(255,255,255,${highlightOpacity})`} strokeWidth={1.4} strokeLinecap="round" />
        </G>
    );
};

const ArmorJoint = ({ p, r, fill, stroke }: any) => (
    <G x={p.x} y={p.y}>
        <Circle r={r + 1.5} fill={fill} stroke={stroke} strokeWidth={0} opacity={0.2} />
        <Circle r={r} fill={fill} stroke={stroke} strokeWidth={1.3} />
        <Circle r={r * 0.45} fill="rgba(0,0,0,0.55)" />
        <Circle cx={-r * 0.28} cy={-r * 0.28} r={r * 0.22} fill="rgba(255,255,255,0.35)" />
    </G>
);

// — Mark VII Helmet —
const IronManHelmet = ({ pos, eyeOpen }: { pos: any, eyeOpen: boolean }) => (
    <G x={pos.x} y={pos.y}>
        {/* Depth shadow */}
        <Path d="M -13 0 C -14 -19 14 -19 13 0 L 12 12 L -12 12 Z" fill={RED_DARK} opacity={0.7} />
        {/* Main dome */}
        <Path d="M -11 1 C -12 -17 12 -17 11 1 L 10 12 L -10 12 Z"
            fill={RED_MID} stroke={RED_DARK} strokeWidth={1.5} />
        {/* Dome highlight */}
        <Path d="M -9 -13 C -9 -16 9 -16 9 -13"
            fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={2} />
        {/* Forehead gold spine ridge */}
        <Path d="M -1.5 -16 L 1.5 -16 L 2.5 -1 L -2.5 -1 Z"
            fill={GOLD_MAIN} stroke={GOLD_DARK} strokeWidth={0.8} />
        {/* Left cheek */}
        <Path d="M -11 1 L -8 -11 L -4 -11 L -5 1 Z"
            fill={RED_MAIN} stroke={RED_DARK} strokeWidth={0.8} />
        {/* Right cheek */}
        <Path d="M 11 1 L 8 -11 L 4 -11 L 5 1 Z"
            fill={RED_MAIN} stroke={RED_DARK} strokeWidth={0.8} />
        {/* Left eye */}
        <G x={-5.5} y={-6}>
            <Path d="M -4.5 -2.2 L 0 -2.8 L 4.5 -2.2 L 4.5 2.2 L 0 2.8 L -4.5 2.2 Z"
                fill={eyeOpen ? ARC : "#1a1a1a"} stroke={GOLD_DARK} strokeWidth={0.6} />
            {eyeOpen && <Path d="M -4.5 -2.2 L 0 -2.8 L 4.5 -2.2 L 4.5 2.2 L 0 2.8 L -4.5 2.2 Z"
                fill="url(#iEyeGlow)" />}
        </G>
        {/* Right eye */}
        <G x={5.5} y={-6}>
            <Path d="M -4.5 -2.2 L 0 -2.8 L 4.5 -2.2 L 4.5 2.2 L 0 2.8 L -4.5 2.2 Z"
                fill={eyeOpen ? ARC : "#1a1a1a"} stroke={GOLD_DARK} strokeWidth={0.6} />
            {eyeOpen && <Path d="M -4.5 -2.2 L 0 -2.8 L 4.5 -2.2 L 4.5 2.2 L 0 2.8 L -4.5 2.2 Z"
                fill="url(#iEyeGlow)" />}
        </G>
        {/* Gold faceplate lower */}
        <Path d="M -9 2 L 9 2 L 8 12 L 0 14 L -8 12 Z"
            fill={GOLD_MID} stroke={GOLD_DARK} strokeWidth={1} />
        <Path d="M -7 3 L 7 3" fill="none" stroke={GOLD_LIGHT} strokeWidth={0.8} opacity={0.5} />
        {/* Mouth grille */}
        {[-3, 0, 3].map((x, i) => (
            <Line key={i} x1={x} y1={7} x2={x} y2={11} stroke={RED_DARK} strokeWidth={1.2} />
        ))}
    </G>
);

// — Arm: shoulder pad → upper arm → elbow → forearm → gauntlet —
const IronManArm = ({ joints }: { joints: any[] }) => {
    if (joints.length < 3) return null;
    const [j0, j1, j2] = joints;
    return (
        <>
            {/* Shoulder pad */}
            <G x={j0.x} y={j0.y}>
                <Ellipse rx={10} ry={8} fill={RED_MID} stroke={RED_DARK} strokeWidth={1.2} />
                <Ellipse rx={7} ry={5} fill={RED_MAIN} stroke={RED_DARK} strokeWidth={0.7} />
                <Line x1={-7} y1={-2} x2={7} y2={-2} stroke="rgba(255,255,255,0.2)" strokeWidth={1.2} />
            </G>
            {/* Upper arm — red */}
            <ArmorPlate a={j0} b={j1} w0={10} w1={8} fill={RED_MAIN} stroke={RED_DARK} />
            {/* Elbow joint — gold */}
            <ArmorJoint p={j1} r={5.5} fill={GOLD_MAIN} stroke={GOLD_DARK} />
            {/* Forearm — gold */}
            <ArmorPlate a={j1} b={j2} w0={8} w1={7} fill={GOLD_MID} stroke={GOLD_DARK} highlightOpacity={0.4} />
            {/* Forearm red stripe */}
            <ArmorPlate a={j1} b={j2} w0={3} w1={2.5} fill={RED_MAIN} stroke={RED_DARK} highlightOpacity={0} />
            {/* Gauntlet */}
            <G x={j2.x} y={j2.y}>
                <Ellipse rx={8} ry={6} fill={RED_MAIN} stroke={RED_DARK} strokeWidth={1.3} />
                <Ellipse rx={5} ry={3.5} fill={RED_MID} opacity={0.7} />
                <Circle r={3.2} fill={ARC} opacity={0.95} />
                <Circle r={5} fill="none" stroke={ARC} strokeWidth={0.8} opacity={0.45} />
                <Circle r={1.2} fill="#ffffff" opacity={0.9} />
            </G>
        </>
    );
};

// — Leg: hip joint → thigh → knee → shin → boot —
const IronManLeg = ({ joints }: { joints: any[] }) => {
    if (joints.length < 3) return null;
    const [j0, j1, j2] = joints;
    return (
        <>
            <ArmorJoint p={j0} r={7} fill={RED_MAIN} stroke={RED_DARK} />
            {/* Thigh — red + gold center stripe */}
            <ArmorPlate a={j0} b={j1} w0={13} w1={11} fill={RED_MAIN} stroke={RED_DARK} />
            <ArmorPlate a={j0} b={j1} w0={4} w1={3} fill={GOLD_MID} stroke={GOLD_DARK} highlightOpacity={0.5} />
            {/* Knee — gold */}
            <ArmorJoint p={j1} r={6.5} fill={GOLD_MAIN} stroke={GOLD_DARK} />
            {/* Shin */}
            <ArmorPlate a={j1} b={j2} w0={11} w1={9} fill={RED_MID} stroke={RED_DARK} />
            {/* Boot */}
            <G x={j2.x} y={j2.y}>
                <Ellipse rx={10} ry={8} fill={RED_DARK} stroke={RED_DARK} strokeWidth={1.3} />
                <Ellipse rx={7} ry={5.5} fill={RED_MID} stroke={RED_DARK} strokeWidth={0.7} />
                <Ellipse rx={4} ry={3} fill={RED_MAIN} opacity={0.8} />
                <Circle r={2.8} fill={ARC} opacity={0.85} />
            </G>
        </>
    );
};

// — Torso: neck → chest plate → abs → hip plate → arc reactor —
const IronManTorso = ({ spine }: { spine: any[] }) => {
    const s = spine;
    const chest = s[3];
    return (
        <>
            {/* Neck */}
            <Line x1={s[0].x} y1={s[0].y} x2={s[1].x} y2={s[1].y}
                stroke={RED_DARK} strokeWidth={9} strokeLinecap="round" />
            <Line x1={s[0].x} y1={s[0].y} x2={s[1].x} y2={s[1].y}
                stroke={GOLD_MID} strokeWidth={4} strokeLinecap="round" opacity={0.6} />
            {/* Chest plate */}
            <ArmorPlate a={s[2]} b={s[5]} w0={24} w1={18} fill={RED_MAIN} stroke={RED_DARK} />
            {/* Chest gold edge */}
            <ArmorPlate a={s[2]} b={s[5]} w0={24} w1={18} fill="transparent" stroke={GOLD_MID} highlightOpacity={0} />
            {/* Abs */}
            <ArmorPlate a={s[5]} b={s[8]} w0={18} w1={15} fill={RED_MID} stroke={RED_DARK} />
            {/* Ab detail lines */}
            {[0.3, 0.6].map((t, i) => {
                const px = s[5].x + (s[8].x - s[5].x) * t;
                const py = s[5].y + (s[8].y - s[5].y) * t;
                const w = (18 - (18 - 15) * t) * 0.38;
                return <Line key={i} x1={px - w} y1={py} x2={px + w} y2={py}
                    stroke={RED_DARK} strokeWidth={1.2} opacity={0.7} />;
            })}
            {/* Hip plate */}
            <G x={s[9].x} y={s[9].y}>
                <Ellipse rx={12} ry={7} fill={GOLD_MID} stroke={GOLD_DARK} strokeWidth={1.2} />
                <Ellipse rx={8} ry={4.5} fill={GOLD_MAIN} opacity={0.5} />
            </G>
            {/* Arc Reactor on chest */}
            <G x={chest.x} y={chest.y}>
                <Circle r={13} fill="url(#iReactorBg)" />
                <Circle r={8} fill="none" stroke={GOLD_MAIN} strokeWidth={2} />
                {[0, 60, 120, 180, 240, 300].map((deg, i) => {
                    const rad = deg * Math.PI / 180;
                    return <Line key={i}
                        x1={Math.cos(rad) * 3.5} y1={Math.sin(rad) * 3.5}
                        x2={Math.cos(rad) * 8} y2={Math.sin(rad) * 8}
                        stroke={GOLD_MAIN} strokeWidth={1} opacity={0.7} />;
                })}
                <Circle r={5.5} fill="url(#iReactorCore)" />
                <Circle r={1.8} fill="#ffffff" opacity={0.9} />
            </G>
        </>
    );
};

// — Main export —
export const IronManBuddy = ({ skeleton }: { skeleton: any }) => (
    <>
        <Defs>
            <RadialGradient id="iReactorBg" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor={ARC} stopOpacity="0.35" />
                <Stop offset="100%" stopColor={ARC} stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="iReactorCore" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <Stop offset="40%" stopColor={ARC} stopOpacity="0.95" />
                <Stop offset="100%" stopColor={ARC} stopOpacity="0.2" />
            </RadialGradient>
            <RadialGradient id="iEyeGlow" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <Stop offset="60%" stopColor={ARC} stopOpacity="0.85" />
                <Stop offset="100%" stopColor={ARC} stopOpacity="0.2" />
            </RadialGradient>
        </Defs>

        {/* Draw back-to-front: legs → torso → arms → head */}
        <IronManLeg joints={skeleton.legL} />
        <IronManLeg joints={skeleton.legR} />
        <IronManTorso spine={skeleton.spine} />
        <IronManArm joints={skeleton.armL} />
        <IronManArm joints={skeleton.armR} />
        <IronManHelmet pos={skeleton.spine[0]} eyeOpen={skeleton._eyeOpen} />
    </>
);