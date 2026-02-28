export const theme = {
    colors: {
        background: '#000000',
        surface: 'rgba(0, 0, 0, 0.7)',    // Black with transparency
        surfaceHighlight: 'rgba(30, 41, 59, 0.6)', // Slate gray with transparency
        primary: '#6366f1',
        secondary: '#00FFFF',
        accent: '#FF00FF',
        text: '#FFFFFF',
        textSecondary: 'rgba(255, 255, 255, 0.7)',
        textDim: 'rgba(255, 255, 255, 0.4)',
        success: '#00FF88',
        error: '#FF6B6B',
        warning: '#FFD700',
        border: 'rgba(255, 255, 255, 0.1)',
        glass: 'rgba(255, 255, 255, 0.05)',
        slate: 'rgba(51, 65, 85, 0.8)', // Slate 700
    },
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
    },
    borderRadius: {
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
    },
    typography: {
        header: {
            fontSize: 28,
            fontWeight: 'bold',
            letterSpacing: 0.5,
        },
        title: {
            fontSize: 20,
            fontWeight: '600',
            letterSpacing: 0.25,
        },
        body: {
            fontSize: 16,
            fontWeight: '400',
        },
        caption: {
            fontSize: 12,
            fontWeight: '400',
            letterSpacing: 0.4,
        },
    },
    shadows: {
        default: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
        },
        glow: {
            shadowColor: '#6366f1',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 12,
            elevation: 8,
        },
        small: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
        },
    },
    glass: {
        light: {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
        },
        medium: {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(15px)',
        },
        dark: {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
        },
    },
};
