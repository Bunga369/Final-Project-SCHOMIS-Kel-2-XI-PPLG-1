const urlParams = new URLSearchParams(window.location.search);
let kelasIdAktif = urlParams.get('kelas_id');

const tabelSiswa = document.getElementById('tabelSiswa');
const emptyState = document.getElementById('emptyState');
const modalSiswa = document.getElementById('modalSiswa');
const formSiswa = document.getElementById('formSiswa');
const modalTitle = document.getElementById('modalTitle');
const pesanModal = document.getElementById('pesanModal');
const filterTanggal = document.getElementById('filterTanggal');
const dropdownToggle = document.getElementById('dropdownToggle');
const dropdownMenu = document.getElementById('dropdownMenu');

let daftarKelas = [];


function tanggalHariIni() {
    return new Date().toISOString().slice(0, 10);
}
filterTanggal.value = tanggalHariIni();


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
            tabelSiswa.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        if (!kelasIdAktif) {
            kelasIdAktif = daftarKelas[0].id;
        }

        renderDropdownMenu();
        perbaruiLabelKelasAktif();
        muatDaftarSiswa();
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
    muatDaftarSiswa();
}


dropdownToggle.addEventListener('click', () => {
    dropdownMenu.classList.toggle('show');
});


document.addEventListener('click', (e) => {
    if (!e.target.closest('.kelas-dropdown')) {
        dropdownMenu.classList.remove('show');
    }
});

async function muatDaftarSiswa() {
    try {
        const tanggal = filterTanggal.value;
        const response = await fetch(`/api/siswa/kelas/${kelasIdAktif}?tanggal=${tanggal}`);
        if (response.status === 401) {
            window.location.href = '/login.html';
            return;
        }
        const data = await response.json();
        const siswa = data.siswa;

        if (siswa.length === 0) {
            tabelSiswa.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        tabelSiswa.innerHTML = siswa.map((s) => {
            const isHadir = s.status === 'Hadir';
            const badgeClass = isHadir ? 'badge-hadir' : 'badge-tidak-hadir';
            const tglLahir = s.tanggal_lahir ? new Date(s.tanggal_lahir).toLocaleDateString('id-ID') : '-';

            return `
                <tr>
                    <td>${s.nama}</td>
                    <td>${s.nis}</td>
                    <td>${tglLahir}</td>
                    <td>${s.jenis_kelamin}</td>
                    <td>
                        <span class="badge ${badgeClass}" style="cursor:pointer;" onclick="toggleAbsensi(${s.id}, '${s.status}')" title="Klik untuk mengubah status">
                            ${s.status}
                        </span>
                    </td>
                    <td>
                        <button class="btn-icon" title="Edit" onclick='bukaModalEdit(${JSON.stringify(s)})'>&#9998;</button>
                        <button class="btn-icon delete" title="Hapus" onclick="hapusSiswa(${s.id}, '${s.nama.replace(/'/g, "\\'")}')">&#128465;</button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error(err);
        tabelSiswa.innerHTML = '<tr><td colspan="6">Gagal memuat data siswa.</td></tr>';
    }
}


async function toggleAbsensi(siswaId, statusSekarang) {
    const statusBaru = statusSekarang === 'Hadir' ? 'Tidak Hadir' : 'Hadir';
    try {
        const response = await fetch(`/api/siswa/${siswaId}/absensi`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tanggal: filterTanggal.value, status: statusBaru }),
        });
        if (response.ok) {
            muatDaftarSiswa();
        } else {
            alert('Gagal mengubah status absensi.');
        }
    } catch (err) {
        console.error(err);
        alert('Tidak bisa terhubung ke server.');
    }
}


filterTanggal.addEventListener('change', muatDaftarSiswa);

document.getElementById('btnTambahSiswa').addEventListener('click', () => {
    modalTitle.textContent = 'Tambah Siswa';
    document.getElementById('siswaId').value = '';
    document.getElementById('nis').value = '';
    document.getElementById('namaSiswa').value = '';
    document.getElementById('tanggalLahir').value = '';
    document.getElementById('jenisKelamin').value = '';
    pesanModal.textContent = '';
    modalSiswa.classList.add('show');
});

function bukaModalEdit(siswa) {
    modalTitle.textContent = 'Edit Siswa';
    document.getElementById('siswaId').value = siswa.id;
    document.getElementById('nis').value = siswa.nis;
    document.getElementById('namaSiswa').value = siswa.nama;
    document.getElementById('tanggalLahir').value = siswa.tanggal_lahir ? siswa.tanggal_lahir.slice(0, 10) : '';
    document.getElementById('jenisKelamin').value = siswa.jenis_kelamin;
    pesanModal.textContent = '';
    modalSiswa.classList.add('show');
}

document.getElementById('btnBatalModal').addEventListener('click', () => {
    modalSiswa.classList.remove('show');
});


formSiswa.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('siswaId').value;
    const nis = document.getElementById('nis').value.trim();
    const nama = document.getElementById('namaSiswa').value.trim();
    const tanggal_lahir = document.getElementById('tanggalLahir').value;
    const jenis_kelamin = document.getElementById('jenisKelamin').value;

    if (!nis || !nama || !jenis_kelamin) {
        pesanModal.textContent = 'NIS, nama, dan jenis kelamin wajib diisi.';
        return;
    }

    try {
        const url = id ? `/api/siswa/${id}` : '/api/siswa';
        const method = id ? 'PUT' : 'POST';
        const body = id
            ? { nis, nama, tanggal_lahir, jenis_kelamin }
            : { kelas_id: kelasIdAktif, nis, nama, tanggal_lahir, jenis_kelamin };

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (response.ok) {
            modalSiswa.classList.remove('show');
            muatDaftarSiswa();
        } else {
            pesanModal.textContent = data.message || 'Gagal menyimpan data.';
        }
    } catch (err) {
        console.error(err);
        pesanModal.textContent = 'Tidak bisa terhubung ke server.';
    }
});

async function hapusSiswa(id, nama) {
    const konfirmasi = confirm(`Hapus siswa "${nama}" dari kelas ini?`);
    if (!konfirmasi) return;

    try {
        const response = await fetch(`/api/siswa/${id}`, { method: 'DELETE' });
        if (response.ok) {
            muatDaftarSiswa();
        } else {
            alert('Gagal menghapus siswa.');
        }
    } catch (err) {
        console.error(err);
        alert('Tidak bisa terhubung ke server.');
    }
}

muatDaftarKelasUntukDropdown();