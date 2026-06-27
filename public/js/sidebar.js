function renderSidebar(halamanAktif) {
    const menu = [
        { key: 'kelas', label: 'Manajemen kelas', href: '/manajemen-kelas.html' },
        { key: 'siswa', label: 'Manajemen Siswa', href: '/manajemen-siswa.html' },
        { key: 'akademik', label: 'Akademik', href: '/akademik.html' },
    ];

    const menuHtml = menu.map((m) => {
        const activeClass = m.key === halamanAktif ? ' class="active"' : '';
        return `<a href="${m.href}"${activeClass}>${m.label}</a>`;
    }).join('');

    const sidebarHtml = `
        <div class="sidebar-brand">
            <img src="/img/logo.png" alt="Logo">
            <span>SCHOMIS</span>
        </div>
        <div class="sidebar-menu">
            ${menuHtml}
        </div>
        <button class="btn-keluar" id="btnKeluar">Keluar</button>
    `;

    const sidebarEl = document.getElementById('sidebar');
    if (sidebarEl) {
        sidebarEl.innerHTML = sidebarHtml;
    }

    
    document.getElementById('btnKeluar').addEventListener('click', async () => {
        try {
            await fetch('/api/logout', { method: 'POST' });
        } catch (err) {
            console.error(err);
        }
        window.location.href = '/index.html';
    });
}
