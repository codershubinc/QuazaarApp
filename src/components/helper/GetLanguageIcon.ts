export const getLangIcon = (langName: string) => {
    const n = langName.toLowerCase();
    const map: Record<string, string> = {
        'c#': 'csharp', 'c++': 'cplusplus', 'css': 'css3', 'html': 'html5',
        'shell': 'bash', 'vue': 'vuejs', 'jupyter notebook': 'jupyter', 'vim script': 'vim',
    };
    const slug = map[n] || n.replace(/\s+/g, '');
    return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-original.svg`;
};

