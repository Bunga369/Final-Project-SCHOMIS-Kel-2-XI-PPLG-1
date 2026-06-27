const urlParams = new URLSearchParams(window.location.search);
let kelasIdAktif = urlParams.get('kelas_id');

const tabelNilai = document.getElementById('tabelNilai');
const theadNilai = document.getElementById('theadNilai');
const emptyState = document.getElementById('emptyState');
const dropdownToggle = document.getElementById('dropdownToggle');
const dropdownMenu = document.getElementById('dropdownMenu');
const modalNilai = document.getElementById('modalNilai');
const formNilai = document.getElementById('formNilai');
const pesanModal = document.getElementById('pesanModal');
const containerNilaiMapel = document.getElementById('containerNilaiMapel');
const modalMapel = document.getElementById('modalMapel');
const formMapel = document.getElementById('formMapel');
const pesanModalMapel = document.getElementById('pesanModalMapel');

let daftarKelas = [];
let daftarMapel = [];

async function muatDaftarKelasUntukDropdown() {
    try {
        const response = await fetch('/api/kelas');
        if (response.status === 401) {
            window.location.href = '/login.html';
            return;
        }
        daftarKelas = await response.json();

        if (daftarKelas.length === 0) {
            dropdownToggle.textContent = 'Belum ada kelas';
            tabelNilai.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        if (!kelasIdAktif) {
            kelasIdAktif = daftarKelas[0].id;
        }

        renderDropdownMenu();
        perbaruiLabelKelasAktif();
        muatNilai();
    } catch (err) {
        console.error(err);
    }
}

function renderDropdownMenu() {
    dropdownMenu.innerHTML = daftarKelas.map((k) => `
        <a href="#" onclick="gantiKelas(${k.id}); return false;">${k.nama_kelas}</a>
    `).join('');
}

function perbaruiLabelKelasAktif() {
    const kelas = daftarKelas.find((k) => k.id == kelasIdAktif);
    dropdownToggle.innerHTML = `${kelas ? kelas.nama_kelas : '-'} &#9662;`;
}

function gantiKelas(id) {
    kelasIdAktif = id;
    perbaruiLabelKelasAktif();
    dropdownMenu.classList.remove('show');
    muatNilai();
}

dropdownToggle.addEventListener('click', () => {
    dropdownMenu.classList.toggle('show');
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.kelas-dropdown')) {
        dropdownMenu.classList.remove('show');
    }
});

function renderTheadNilai() {
    const kolomMapel = daftarMapel.map((m) => `<th>${m.nama_mapel}</th>`).join('');

    theadNilai.innerHTML = `
        <tr>
            <th rowspan="2" style="vertical-align: middle;">NIS</th>
            <th rowspan="2" style="vertical-align: middle;">Nama</th>
            <th colspan="${daftarMapel.length}" style="text-align:center;">Mata Pelajaran</th>
            <th rowspan="2" style="vertical-align: middle;">Rata Rata</th>
            <th rowspan="2" style="vertical-align: middle;">Aksi</th>
        </tr>
        <tr>
            ${kolomMapel}
        </tr>
    `;
}

async function muatNilai() {
    try {
        const response = await fetch(`/api/nilai/kelas/${kelasIdAktif}`);
        const result = await response.json();

        daftarMapel = result.mapel;
        const data = result.data;

        renderTheadNilai();

        if (data.length === 0) {
            tabelNilai.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        tabelNilai.innerHTML = data.map((s) => {
            const kolomNilai = daftarMapel.map((m) => `<td>${s.nilai[m.id]}</td>`).join('');
            return `
                <tr>
                    <td>${s.nis}</td>
                    <td>${s.nama}</td>
                    ${kolomNilai}
                    <td><strong>${s.rata_rata}</strong></td>
                    <td>
                        <button class="btn-icon" title="Edit Nilai" onclick='bukaModalEdit(${JSON.stringify(s)})'>&#9998;</button>
                    </td>
                </tr>
            `;
        }).join('');

        document.getElementById('linkKenaikanKelas').href = `/kenaikan-kelas.html?kelas_id=${kelasIdAktif}`;
    } catch (err) {
        console.error(err);
        tabelNilai.innerHTML = `<tr><td colspan="${daftarMapel.length + 4}">Gagal memuat data nilai.</td></tr>`;
    }
}

function bukaModalEdit(siswa) {
    document.getElementById('siswaIdNilai').value = siswa.siswa_id;
    document.getElementById('nisTampil').value = siswa.nis;
    document.getElementById('namaTampil').value = siswa.nama;

    containerNilaiMapel.innerHTML = daftarMapel.map((m) => `
        <div class="form-group">
            <label for="nilaiMapel${m.id}">${m.nama_mapel}</label>
            <input type="number" id="nilaiMapel${m.id}" data-mapel-id="${m.id}" min="0" max="100" value="${siswa.nilai[m.id]}" required>
        </div>
    `).join('');

    pesanModal.textContent = '';
    modalNilai.classList.add('show');
}

document.getElementById('btnBatalModal').addEventListener('click', () => {
    modalNilai.classList.remove('show');
});

formNilai.addEventListener('submit', async (e) => {
    e.preventDefault();

    const siswaId = document.getElementById('siswaIdNilai').value;
    const inputNilai = containerNilaiMapel.querySelectorAll('input[data-mapel-id]');

    const nilai = {};
    let adaKosong = false;
    inputNilai.forEach((input) => {
        if (input.value === '') {
            adaKosong = true;
        }
        nilai[input.dataset.mapelId] = input.value;
    });

    if (adaKosong) {
        pesanModal.textContent = 'Semua nilai mata pelajaran wajib diisi.';
        return;
    }

    try {
        const response = await fetch(`/api/nilai/${siswaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nilai }),
        });

        const data = await response.json();

        if (response.ok) {
            modalNilai.classList.remove('show');
            muatNilai();
        } else {
            pesanModal.textContent = data.message || 'Gagal menyimpan nilai.';
        }
    } catch (err) {
        console.error(err);
        pesanModal.textContent = 'Tidak bisa terhubung ke server.';
    }
});

document.getElementById('btnTambahMapel').addEventListener('click', () => {
    document.getElementById('namaMapelBaru').value = '';
    pesanModalMapel.textContent = '';
    modalMapel.classList.add('show');
});

document.getElementById('btnBatalModalMapel').addEventListener('click', () => {
    modalMapel.classList.remove('show');
});

formMapel.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nama_mapel = document.getElementById('namaMapelBaru').value.trim();

    if (!nama_mapel) {
        pesanModalMapel.textContent = 'Nama mata pelajaran wajib diisi.';
        return;
    }

    try {
        const response = await fetch('/api/nilai/mapel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nama_mapel }),
        });

        const data = await response.json();

        if (response.ok) {
            modalMapel.classList.remove('show');
            muatNilai();
        } else {
            pesanModalMapel.textContent = data.message || 'Gagal menambahkan mata pelajaran.';
        }
    } catch (err) {
        console.error(err);
        pesanModalMapel.textContent = 'Tidak bisa terhubung ke server.';
    }
});

muatDaftarKelasUntukDropdown();