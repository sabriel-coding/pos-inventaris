let mainProgram, mainClass, scanner;
let config = {
    headers: {
        authorization: sessionStorage.getItem('token')
    }
};
function getNavbar(element) {
    let name = element.getAttribute('name');
    let daftar = document.getElementById('btnNavbar').getElementsByTagName('button').daftar;
    daftar.getElementsByTagName('h6')[0].innerHTML = "Daftar "+name;
    document.getElementById('btnNavbar').hidden = false;
    mainProgram = name;
    switch (name) {
        case 'pinjam': mainClass = new Pinjam(); break;
        case 'inventaris': mainClass = new Inventaris(); break;
    }
}
function getMain(element) {
    let name = element.getAttribute('name');
    document.getElementById('tableContainer').hidden = false;
    switch (name) {
        case 'qrscan': mainClass.qrscan(); break;
        case 'qrbuild': mainClass.qrbuild(); break;
        case 'daftar': mainClass.daftar(); break;
        case 'tambah': mainClass.tambah(); break;
        case 'update': mainClass.update(); break;
        case 'hapus': mainClass.hapus(); break;
    }
} function resetModal() {
    document.getElementById("modalContainer").innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header" id="modalHeader">
                <h5 class="modal-title" id="modalTitle"></h5>
                <button class="close" type="button" data-dismiss="modal" aria-label="Close" id="modalClose">
                    <p aria-hidden="true">&times;</p>
                </button>
            </div>
            <div class="modal-body" id="modalBody"></div>
            <div class="modal-footer" id="modalFooter"></div>
        </div>
    </div>
    `;
} function resetTable() {
    document.getElementById("tableBody").innerHTML = "";
}

class Pinjam {
    daftar () { resetTable();
        document.getElementById('tableContainer').hidden = false;
        document.getElementById('tableTitle').innerHTML = "Daftar Peminjam";
        document.getElementById('tableHead').innerHTML = `
            <th>No</th>
            <th>Id</th>
            <th>Kode</th>
            <th>Nama Barang</th>
            <th>Nama Peminjam</th>
            <th>Type</th>
            <th>Kelas</th>
            <th>Tgl Pinjam</th>
            <th>Tgl Kembali</th>
            <th>Status</th>
            <th>Actions</th>
        `;
        axios.get('http://localhost:4000/peminjam', config).then((res) => {
            res.data.map((item, index) => {
                $("#tableBody").append(`
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.id}</td>
                        <td>${item.kode}</td>
                        <td>${item.nama_barang}</td>
                        <td>${item.nama_peminjam}</td>
                        <td>${item.type}</td>
                        <td>${item.kelas}</td>
                        <td>${item.tgl_pinjam}</td>
                        <td>${item.tgl_kembali}</td>
                        <td>${item.status}</td>
                        <td align="center"><div class="btn-group btn-group-sm">${this.checkstatus(
							item.status,
							item.id
						)}</div></td>
                    </tr>
                `);
            }) 
        })
    }

    qrscan () { resetModal();
        document.getElementById('modalClose').style.display = "none";
        $('#modalContainer').modal('show');

        document.getElementById("modalTitle").innerHTML = "Scan QR-Code";
        document.getElementById('modalBody').innerHTML = `
            <div class="d-flex justify-content-center align-items-center">
                <video width="350px" id="qrVideo"></video>
            </div>
        `; document.getElementById('modalFooter').innerHTML = `
            <button class="btn btn-secondary" type="button" data-dismiss="modal" onclick="scanner.stop()">Close</button>
        `;
        
        scanner = new Instascan.Scanner({video: document.getElementById('qrVideo')})
        scanner.addListener('scan', (content) => {
            // Content Format should be {"name": "value"}
            scanner.stop();
            this.tambah(JSON.parse(content));
        });
        Instascan.Camera.getCameras().then(function (cameras) {
            if (cameras.length > 0) scanner.start(cameras[0]);
            else console.error('No cameras found');

        }).catch(function (e) {
            console.error(e);
        });
    }

    qrbuild () { resetModal();
        $('#modalContainer').modal('show');

        document.getElementById("modalTitle").innerHTML = "QR-Code Generator";
        document.getElementById("modalBody").innerHTML = `
            <div class="input-group">
                <div class="input-group-prepend">
                    <div class="input-group-text">
                        <i class="fas fa-qrcode"></i>
                    </div>
                </div>
                <input type="text" id="qrInput" name="qrinput" class="form-control"/>
                <div class="input-group-append">
                    <button type="button" class="btn btn-primary" onclick="mainClass.qrgenerator(document.getElementById('qrCanvas'), document.getElementById('qrInput').value)">Generate</button>
                </div>
            </div>
            <div class="d-flex justify-content-end position-relative mt-4" id="qrBuildContainer">
                <div class="bg w-100 d-flex justify-content-between align-items-center" style="background: url('dist/img/bg-1.jpg'); background-position: center; background-size: cover">
                    <div class="ml-4 text-white">
                        <h3 class="navbar-brand m-0">SMKMUHBLIGO</h3>
                        <h6 id="qrKode"></h6>
                    </div>
                    <canvas id="qrCanvas" class="m-4"></canvas>
                </div>
            </div>
        `; document.getElementById("modalFooter").innerHTML = `
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" onclick="mainClass.quickpdf(document.getElementById('qrBuildContainer'))">Print</button>
        `;


    }

    tambah (content = null) { resetModal();
        $('#modalContainer').modal('show');

        document.getElementById("modalBody").innerHTML = `
        <div class="form-group form-group-sm input-group">
            <input type="text" name="kode" class="form-control" id="inputKode" placeholder="Kode Barang">
            <div class="input-group-append">
                <button class="btn btn-primary px-4" onclick="mainClass.kodevalidator()">Cek Kode</button>
            </div>
        </div>
        <div class="form-group form-group-sm">
            <input type="text" name="nama_barang" class="form-control" placeholder="Nama Barang" id="inputNamaBarang" disabled>
        </div>
        <div class="form-group form-group-sm">
            <input type="text" name="type" class="form-control" placeholder="Type" id="inputType" disabled>
        </div>
        <hr>
        <div class="form-group form-group-sm">
            <input type="text" name="nama_peminjam" class="form-control" placeholder="Nama Peminjam">
        </div>
        <div class="form-group form-group-sm">
            <input type="text" name="kelas" class="form-control" placeholder="Kelas Peminjam">
        </div>
        `;
        document.getElementById('modalFooter').innerHTML = `
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-primary" onclick="mainClass.postpinjam()">Pinjam</button>
        `;

        if (content === null) {
            document.getElementById("modalTitle").innerHTML = "";
        } else {
            document.getElementById("modalTitle").innerHTML = `
                <button class="btn bg-none" onclick="mainClass.qrscan()"><i class="fas fa-long-arrow-alt-left"></i></button>
            `; document.getElementById("inputKode").value = content.kode; this.kodevalidator();
        } document.getElementById("modalTitle").innerHTML += " Data Peminjam";
    }

    update () { resetModal();
        $('#modalContainer').modal('show');

        document.getElementById('modalTitle').innerHTML = "Update Data Peminjam";
        document.getElementById("modalBody").innerHTML = `
            <div class="form-group form-group-sm input-group">
                <input type="text" name="id" class="form-control" id="inputID" placeholder="ID Peminjaman">
                <div class="input-group-append">
                    <button class="btn btn-primary px-4" onclick="mainClass.idtoupdate()">Cek ID</button>
                </div>
            </div>
            <div class="form-group form-group-sm">
                <input type="text" name="kode" class="form-control" placeholder="Kode Barang" id="inputKodeBarang" disabled>
            </div>
            <div class="form-group form-group-sm">
                <input type="text" name="nama_barang" class="form-control" placeholder="Nama Barang" id="inputNamaBarang" disabled>
            </div>
            <div class="form-group form-group-sm">
                <input type="text" name="nama_peminjam" class="form-control" placeholder="Nama Peminjam" disabled>
            </div>
            <div class="form-group form-group-sm">
                <input type="text" name="type" class="form-control" placeholder="Type" id="inputType" disabled>
            </div>
            <div class="form-group form-group-sm">
                <input type="text" name="kelas" class="form-control" placeholder="Kelas Peminjam" disabled>
            </div>
            <div class="form-group form-group-sm">
                <input type="text" name="tgl_pinjam" class="form-control" placeholder="Tanggal Pinjam" disabled>
            </div>
            <div class="form-group form-group-sm">
                <input type="text" name="tgl_kembali" class="form-control" placeholder="Tanggal Kembali" disabled>
            </div>
            <div class="form-group form-group-sm">
                <input type="text" name="status" class="form-control" placeholder="Status" disabled>
            </div>
        `; document.getElementById('modalFooter').innerHTML = `
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="mainClass.postupdate()">Update</button>
        `;

    }

    hapus () { resetModal();
        $('#modalContainer').modal('show');

        document.getElementById('modalTitle').innerHTML = "Hapus Data Peminjaman";
        document.getElementById("modalBody").innerHTML = `
            <div class="form-group form-group-sm input-group">
                <input type="text" name="id" class="form-control" id="inputID" placeholder="ID Peminjaman">
                <div class="input-group-append">
                    <button class="btn btn-primary px-4" onclick="mainClass.idtohapus()">Cek ID</button>
                </div>
            </div>
            <div style="overflow-x: auto">
                <table class="table table-bordered table-hover">
                    <thead>
                        <th>Id</th>
                        <th>Kode</th>
                        <th>Nama Barang</th>
                        <th>Nama Peminjam</th>
                        <th>Type</th>
                        <th>Kelas</th>
                        <th>Tgl Pinjam</th>
                        <th>Tgl Kembali</th>
                        <th>Status</th>
                    </thead>
                    <tbody id="modalTableBody">
                    </tbody>
                </table>
            </div>
        `; document.getElementById("modalFooter").innerHTML = `
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" onclick="mainClass.posthapus(document.getElementById('inputID').value)">Hapus</button>
        `;
    }

    checkstatus (status, id) {
        let str;
        if (status == 'pinjam') str = `<button type="button" class="btn btn-sm btn-success" onclick="mainClass.kembalikan(${id})"><i class="fas fa-check"></i></button>`;
        else str = `<button disabled type="button" class="btn btn-sm btn-success" onclick="mainClass.kembalikan(${id})"><i class="fas fa-check"></i></button>`;
        return (str += `<button type="button" class="btn btn-sm btn-danger" onclick="mainClass.posthapus(${''+id})"><i class="fas fa-trash"></i></button>`);
    }

    kembalikan (id) {
        axios.get('http://localhost:4000/kembali/'+id, config).then((res) => {
            this.daftar(); alert(res.data.message);
        });
    }

    qrgenerator (container, content) {
        QRCode.toCanvas(container, content);
    }

    quickpdf (element) {
        html2pdf().set({margin: [5, 40]}).from(element).save()
    }

    kodevalidator () {
        let kode = document.getElementById('inputKode');
        let target = document.getElementById('inputNamaBarang');
        let type = document.getElementById('inputType');
        axios.get('http://localhost:4000/inventaris/kode/'+kode.value.toLowerCase(), config).then((res) => {
            if (res.data.length > 0) {
                target.value = res.data[0].name;
                type.value = res.data[0].type;
                kode.style.borderColor = "#0C0";
            } else {
                target.value = "";
                type.value = "";
                kode.style.borderColor = "#C00";
            }
        })
    }

    idtoupdate () {
        let idElement = document.getElementById('inputID');
        if (idElement.value.length === 0) return;
        let inputs = document.getElementById('modalBody').getElementsByTagName('input');
        axios.get('http://localhost:4000/peminjam/'+idElement.value, config).then((res) => {
            let data = {
                kelas: res.data.kelas,
                kode: res.data.kode,
                nama_barang: res.data.nama_barang,
                nama_peminjam: res.data.nama_peminjam,
                status: res.data.status,
                tgl_kembali: res.data.tgl_kembali,
                tgl_pinjam: res.data.tgl_pinjam,
                type: res.data.type
            }
            if (res.data.message === undefined) {
                for (let i=0; i<=8; i++) {
                    inputs[i].removeAttribute('disabled');
                } idElement.style.borderColor = "#0C0";
                inputs.kelas.value = data.kelas;
                inputs.kode.value = data.kode;
                inputs.nama_barang.value = data.nama_barang;
                inputs.nama_peminjam.value = data.nama_peminjam;
                inputs.status.value = data.status;
                inputs.tgl_kembali.value = data.tgl_kembali;
                inputs.tgl_pinjam.value = data.tgl_pinjam;
                inputs.type.value = data.type;
            } else {
                for (let i=1; i<=8; i++) {
                    inputs[i].setAttribute("disabled", "true");
                } idElement.style.borderColor = "#C00";
				inputs.kelas.value = "";
				inputs.kode.value = "";
				inputs.nama_barang.value = "";
				inputs.nama_peminjam.value = "";
				inputs.status.value = "";
				inputs.tgl_kembali.value = "";
				inputs.tgl_pinjam.value = "";
				inputs.type.value = "";
            }
        })
    }

    idtohapus () {
        let id = document.getElementById('inputID');
        axios.get('http://localhost:4000/peminjam/'+id.value, config).then((res) => {
            let item = res.data;

            document.getElementById('modalTableBody').innerHTML = `
            <tr>
            <td>${item.id}</td>
                <td>${item.kode}</td>
                <td>${item.nama_barang}</td>
                <td>${item.nama_peminjam}</td>
                <td>${item.type}</td>
                <td>${item.kelas}</td>
                <td>${item.tgl_pinjam}</td>
                <td>${item.tgl_kembali}</td>
                <td>${item.status}</td>
            </tr>
            `;
            
            if (res.data.message === undefined) id.style.borderColor = "#0C0";
            else {
                id.style.borderColor = "#C00";
                document.getElementById('modalTableBody').innerHTML = "<tr><td colspan='8'>ID Tidak Ditemukan</td></tr>";
            }
        })
    }

    postpinjam () {
        let inputs = document.getElementById('modalBody').getElementsByTagName('input');
        let dataPeminjam = {
            kode: inputs.kode.value,
            type: inputs.type.value,
            kelas: inputs.kelas.value,
            nama_barang: inputs.nama_barang.value,
            nama_peminjam: inputs.nama_peminjam.value
        }
        axios.post('http://localhost:4000/peminjam', dataPeminjam, config).then((res) => {
            alert('Berhasil Meminjam Barang');
            $('#modalContainer').modal('hide');
            this.daftar();
        })
    }

    postupdate () {
        let inputs = document.getElementById('modalBody').getElementsByTagName('input');
        let dataUpdate = {
			kode: inputs.kode.value,
			type: inputs.type.value,
			kelas: inputs.kelas.value,
			nama_barang: inputs.nama_barang.value,
			nama_peminjam: inputs.nama_peminjam.value,
			tgl_pinjam: inputs.tgl_pinjam.value,
			tgl_kembali: inputs.tgl_kembali.value,
            status: inputs.status.value
		}; axios.put('http://localhost:4000/peminjam/'+inputs.id.value, dataUpdate, config).then((res) => {
            alert('Berhasil Mengupdate Data');
            $('#modalContainer').modal('hide');
            this.daftar();
        })
    }

    posthapus (id) {
        // let id = document.getElementById('inputID').value;
        axios.delete('http://localhost:4000/peminjam/'+id, config).then((res) => {
            alert("Berhasil Menghapus Data");
			$("#modalContainer").modal("hide");
			this.daftar();
        });
    }
    
}
class Inventaris {
    daftar () { resetTable();
        document.getElementById('tableContainer').hidden = false;
        document.getElementById('tableTitle').innerHTML = "Daftar Inventaris";
        document.getElementById("tableHead").innerHTML = `
            <th>No</th>
            <th>Id</th>
            <th>Kode</th>
            <th>Nama Barang</th>
            <th>Type</th>
            <th>Actions</th>
        `;
        axios.get('http://localhost:4000/inventaris', config).then((res) => {
            res.data.map((item, index) => {
                $("#tableBody").append(`
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.id}</td>
                        <td>${item.kode}</td>
                        <td>${item.name}</td>
                        <td>${item.type}</td>
                        <td align="center"><div class="btn-group"><button type="button" class="btn btn-success" onclick="mainClass.update(${item.id})"><i class="fas fa-upload"></i></button>
                        <button type="button" class="btn btn-danger" onclick="mainClass.posthapus(${item.id})"><i class="fas fa-trash"></i></button></div></td>
                    </tr>
                `);
            }) 
        })
    }

    qrscan () { resetModal();
        document.getElementById('modalClose').style.display = "none";
        $('#modalContainer').modal('show');

        document.getElementById("modalTitle").innerHTML = "Scan QR-Code";
        document.getElementById('modalBody').innerHTML = `
            <div class="d-flex justify-content-center align-items-center">
                <video width="350px" id="qrVideo"></video>
            </div>
        `; document.getElementById('modalFooter').innerHTML = `
            <button class="btn btn-secondary" type="button" data-dismiss="modal" onclick="scanner.stop()">Close</button>
        `;
        
        scanner = new Instascan.Scanner({video: document.getElementById('qrVideo')})
        scanner.addListener('scan', (content) => {
            // Content Format should be {"name": "value"}
            // console.log(JSON.parse(content));
            scanner.stop();
            this.tambah(JSON.parse(content));
        });
        Instascan.Camera.getCameras().then(function (cameras) {
            if (cameras.length > 0) scanner.start(cameras[0]);
            else console.error('No cameras found');

        }).catch(function (e) {
            console.error(e);
        });
    }

    qrbuild () { resetModal();
        $('#modalContainer').modal('show');

        document.getElementById("modalTitle").innerHTML = "QR-Code Generator";
        document.getElementById("modalBody").innerHTML = `
            <div class="input-group">
                <div class="input-group-prepend">
                    <div class="input-group-text">
                        <i class="fas fa-qrcode"></i>
                    </div>
                </div>
                <input type="text" id="qrInput" name="qrinput" class="form-control"/>
                <div class="input-group-append">
                    <button type="button" class="btn btn-primary" onclick="mainClass.qrgenerator(document.getElementById('qrCanvas'), document.getElementById('qrInput').value)">Generate</button>
                </div>
            </div>
            <div class="d-flex justify-content-end position-relative mt-4" id="qrBuildContainer">
                <div class="bg w-100 d-flex justify-content-between align-items-center" style="background: url('dist/img/bg-1.jpg'); background-position: center; background-size: cover">
                    <div class="ml-4 text-white">
                        <h3 class="navbar-brand m-0">SMKMUHBLIGO</h3>
                        <h6 id="qrKode"></h6>
                    </div>
                    <canvas id="qrCanvas" class="m-4"></canvas>
                </div>
            </div>
        `; document.getElementById("modalFooter").innerHTML = `
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" onclick="mainClass.quickpdf(document.getElementById('qrBuildContainer'))">Print</button>
        `;
    }
    tambah (content = null) { resetModal();
        $('#modalContainer').modal('show');

        document.getElementById("modalBody").innerHTML = `
        <div class="form-group form-group-sm">
            <input type="text" name="kode" class="form-control" id="inputKode" placeholder="Kode Barang">
        </div>
        <div class="form-group form-group-sm">
            <input type="text" name="name" class="form-control" placeholder="Nama Barang" id="inputNamaBarang">
        </div>
        <div class="form-group form-group-sm">
            <input type="text" name="type" class="form-control" placeholder="Type" id="inputType">
        </div>
        <hr>
        `;
        document.getElementById('modalFooter').innerHTML = `
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="mainClass.posttambah()">Tambah</button>
        `;

        if (content == null) {
            document.getElementById("modalTitle").innerHTML = "";
        } else {
            document.getElementById("modalTitle").innerHTML = `
                <button class="btn bg-none" onclick="mainClass.qrscan()"><i class="fas fa-long-arrow-alt-left"></i></button>
            `; let inputs = document.getElementById('modalBody').getElementsByTagName('input');
            // document.getElementById("inputKode").value = content.kode; this.kodevalidator();
            inputs.kode.value = content.kode;
            inputs.name.value = content.name;
            inputs.type.value = content.type;
        } document.getElementById("modalTitle").innerHTML += " Data Inventaris";
    }

    update (id = null) { resetModal();
        $('#modalContainer').modal('show');

        document.getElementById('modalTitle').innerHTML = "Update Data Inventaris";
        document.getElementById("modalBody").innerHTML = `
            <div class="form-group form-group-sm input-group">
                <input type="text" name="id" class="form-control" id="inputID" placeholder="ID Barang">
                <div class="input-group-append">
                    <button class="btn btn-primary px-4" onclick="mainClass.idtoupdate()">Cek ID</button>
                </div>
            </div>
            <div class="form-group form-group-sm">
                <input type="text" name="kode" class="form-control" placeholder="Kode Barang" id="inputKodeBarang" disabled>
            </div>
            <div class="form-group form-group-sm">
                <input type="text" name="name" class="form-control" placeholder="Nama Barang" id="inputNamaBarang" disabled>
            </div>
            <div class="form-group form-group-sm">
                <input type="text" name="type" class="form-control" placeholder="Type" id="inputType" disabled>
            </div>
        `; document.getElementById('modalFooter').innerHTML = `
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="mainClass.postupdate()">Update</button>
        `;

        if (id !== null) {
            document.getElementById('inputID').value = id;
            this.idtoupdate()
        }

    }

    hapus () { resetModal();
        $('#modalContainer').modal('show');

        document.getElementById('modalTitle').innerHTML = "Hapus Data Inventaris";
        document.getElementById("modalBody").innerHTML = `
            <div class="form-group form-group-sm input-group">
                <input type="text" name="id" class="form-control" id="inputID" placeholder="ID Peminjaman">
                <div class="input-group-append">
                    <button class="btn btn-primary px-4" onclick="mainClass.idtohapus()">Cek ID</button>
                </div>
            </div>
            <div style="overflow-x: auto">
                <table class="table table-bordered table-hover">
                    <thead>
                        <th>Id</th>
                        <th>Kode</th>
                        <th>Nama Barang</th>
                        <th>Type</th>
                    </thead>
                    <tbody id="modalTableBody">
                    </tbody>
                </table>
            </div>
        `; document.getElementById("modalFooter").innerHTML = `
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" onclick="mainClass.posthapus(document.getElementById('inputID').value)">Hapus</button>
        `;
    }

    // checkstatus (status, id) {
    //     let str;
    //     if (status == 'pinjam') str = `<button type="button" class="btn btn-sm btn-success" onclick="mainClass.kembalikan(${id})"><i class="fas fa-check"></i></button>`;
    //     else str = `<button disabled type="button" class="btn btn-sm btn-success" onclick="mainClass.kembalikan(${id})"><i class="fas fa-check"></i></button>`;
    //     return (str += `<button type="button" class="btn btn-sm btn-danger" onclick="mainClass.posthapus(${''+id})"><i class="fas fa-trash"></i></button>`);
    // }

    // kembalikan (id) {
    //     axios.get('http://localhost:4000/kembali/'+id, config).then((res) => {
    //         this.daftar(); alert(res.data.message);
    //     });
    // }

    qrgenerator (container, content) {
        QRCode.toCanvas(container, content);
    }

    quickpdf (element) {
        html2pdf().set({margin: [5, 40]}).from(element).save()
    }

    // kodevalidator () {
    //     let kode = document.getElementById('inputKode');
    //     let target = document.getElementById('inputNamaBarang');
    //     let type = document.getElementById('inputType');
    //     axios.get('http://localhost:4000/inventaris/kode/'+kode.value.toLowerCase(), config).then((res) => {
    //         if (res.data.length > 0) {
    //             target.value = res.data[0].name;
    //             type.value = res.data[0].type;
    //             kode.style.borderColor = "#0C0";
    //         } else {
    //             target.value = "";
    //             type.value = "";
    //             kode.style.borderColor = "#C00";
    //         }
    //     })
    // }

    idtoupdate () {
        let idElement = document.getElementById('inputID');
        if (idElement.value.length === 0) return;
        let inputs = document.getElementById('modalBody').getElementsByTagName('input');
        axios.get('http://localhost:4000/inventaris/'+idElement.value, config).then((res) => {
            let data = {
                kode: res.data.kode,
                name: res.data.name,
                type: res.data.type
            }
            if (res.data.message === undefined) {
                for (let i=0; i<=3; i++) {
                    inputs[i].removeAttribute('disabled');
                } idElement.style.borderColor = "#0C0";
                inputs.kode.value = data.kode;
                inputs.name.value = data.name;
                inputs.type.value = data.type;
            } else {
                for (let i=1; i<=3; i++) {
                    inputs[i].setAttribute("disabled", "true");
                } idElement.style.borderColor = "#C00";
				inputs.kode.value = "";
				inputs.name.value = "";
				inputs.type.value = "";
            }
        })
    }

    idtohapus () {
        let id = document.getElementById('inputID');
        axios.get('http://localhost:4000/inventaris/'+id.value, config).then((res) => {
            let item = res.data;

            document.getElementById('modalTableBody').innerHTML = `
            <tr>
                <td>${item.id}</td>
                <td>${item.kode}</td>
                <td>${item.name}</td>
                <td>${item.type}</td>
            </tr>
            `;
            
            if (res.data.message === undefined) id.style.borderColor = "#0C0";
            else {
                id.style.borderColor = "#C00";
                document.getElementById('modalTableBody').innerHTML = "<tr><td colspan='8'>ID Tidak Ditemukan</td></tr>";
            }
        })
    }

    posttambah () {
        let inputs = document.getElementById('modalBody').getElementsByTagName('input');
        let dataPeminjam = {
            kode: inputs.kode.value,
            name: inputs.name.value,
            type: inputs.type.value
        }
        axios.post('http://localhost:4000/inventaris', dataPeminjam, config).then((res) => {
            alert('Berhasil Menambahkan Data');
            $('#modalContainer').modal('hide');
            this.daftar();
        })
    }

    postupdate () {
        let inputs = document.getElementById('modalBody').getElementsByTagName('input');
        let dataUpdate = {
			kode: inputs.kode.value,
			type: inputs.type.value,
			name: inputs.name.value,
		}; axios.put('http://localhost:4000/inventaris/'+inputs.id.value, dataUpdate, config).then((res) => {
            alert('Berhasil Mengupdate Data');
            $('#modalContainer').modal('hide');
            this.daftar();
        })
    }

    posthapus (id) {
        // let id = document.getElementById('inputID').value;
        axios.delete('http://localhost:4000/inventaris/'+id, config).then((res) => {
            alert("Berhasil Menghapus Data");
			$("#modalContainer").modal("hide");
			this.daftar();
        });
    }
    
}