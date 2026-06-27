const tabelKelas = document.getElementById('tabelKelas');
const emptyState = document.getElementById('emptyState');
const modalKelas = document.getElementById('modalKelas');
const formKelas = document.getElementById('formKelas');
const modalTitle = document.getElementById('modalTitle');
const pesanModal = document.getElementById('pesanModal');

function bukaSiswaKelas(kelasId, namaKelas) {
    window.location.href = `/manajemen-siswa.html?kelas_id=${kelasId}&nama_kelas=${encodeURIComponent(namaKelas)}`;
}


async function muatDaftarKelas() {
    try {
        const response = await fetch('/api/kelas');
        if (response.status === 401) {
            window.location.href = '/login.html';
            return;
        }
        const data = await response.json();

        if (data.length === 0) {
            tabelKelas.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        tabelKelas.innerHTML = data.map((k) => `
            <tr>
                <td style="cursor:pointer; font-weight:600; color:#2541f5;" onclick="bukaSiswaKelas(${k.id}, '${k.nama_kelas.replace(/'/g, "\\'")}')">${k.nama_kelas}</td>
                <td>${k.wali_kelas}</td>
                <td>${k.jumlah_siswa}</td>
                <td>
                    <button class="btn-icon" title="Edit" onclick="bukaModalEdit(${k.id})">&#9998;</button>
                    <button class="btn-icon delete" title="Hapus" onclick="hapusKelas(${k.id}, '${k.nama_kelas.replace(/'/g, "\\'")}')">&#128465;</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
        tabelKelas.innerHTML = '<tr><td colspan="4">Gagal memuat data kelas.</td></tr>';
    }
}


document.getElementById('btnTambahKelas').addEventListener('click', () => {
    modalTitle.textContent = 'Tambah Kelas';
    document.getElementById('kelasId').value = '';
    document.getElementById('namaKelas').value = '';
    document.getElementById('waliKelas').value = '';
    pesanModal.textContent = '';
    modalKelas.classList.add('show');
});


async function bukaModalEdit(id) {
    try {
        const response = await fetch(`/api/kelas/${id}`);
        const data = await response.json();

        modalTitle.textContent = 'Edit Kelas';
        document.getElementById('kelasId').value = data.id;
        document.getElementById('namaKelas').value = data.nama_kelas;
        document.getElementById('waliKelas').value = data.wali_kelas;
        pesanModal.textContent = '';
        modalKelas.classList.add('show');
    } catch (err) {
        console.error(err);
        alert('Gagal mengambil data kelas.');
    }
}


document.getElementById('btnBatalModal').addEventListener('click', () => {
    modalKelas.classList.remove('show');
});


formKelas.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('kelasId').value;
    const nama_kelas = document.getElementById('namaKelas').value.trim();
    const wali_kelas = document.getElementById('waliKelas').value.trim();

    if (!nama_kelas || !wali_kelas) {
        pesanModal.textContent = 'Nama kelas dan wali kelas wajib diisi.';
        return;
    }

    try {
        const url = id ? `/api/kelas/${id}` : '/api/kelas';
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nama_kelas, wali_kelas }),
        });

        const data = await response.json();

        if (response.ok) {
            modalKelas.classList.remove('show');
            muatDaftarKelas();
        } else {
            pesanModal.textContent = data.message || 'Gagal menyimpan data.';
        }
    } catch (err) {
        console.error(err);
        pesanModal.textContent = 'Tidak bisa terhubung ke server.';
    }
});


async function hapusKelas(id, nama) {
    const konfirmasi = confirm(`Hapus kelas "${nama}"? Semua data siswa di kelas ini juga akan terhapus.`);
    if (!konfirmasi) return;

    try {
        const response = await fetch(`/api/kelas/${id}`, { method: 'DELETE' });
        if (response.ok) {
            muatDaftarKelas();
        } else {
            alert('Gagal menghapus kelas.');
        }
    } catch (err) {
        console.error(err);
        alert('Tidak bisa terhubung ke server.');
    }
}


muatDaftarKelas();
