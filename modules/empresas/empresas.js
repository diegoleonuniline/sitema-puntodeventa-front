// ==================== CAFI EMPRESAS/CONFIG ====================

// Verificar sesión
if (!API.isLoggedIn()) {
    window.location.href = '../../index.html';
}

// Variables globales
var seccionActual = 'empresa';
var sucursales = [];
var almacenes = [];
var usuarios = [];
var impuestos = [];
var metodosPago = [];
var unidades = [];
var categorias = [];

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', function() {
    cargarUsuarioUI();
    configurarNavegacion();
    cargarDatosIniciales();
});

// Cargar info del usuario en UI
function cargarUsuarioUI() {
    var u = API.usuario;
    if (!u) return;
    
    var iniciales = u.nombre.split(' ').map(function(n) { return n.charAt(0); }).join('').substring(0, 2);
    document.getElementById('userAvatar').textContent = iniciales.toUpperCase();
    document.getElementById('userName').textContent = u.nombre;
    document.getElementById('userRol').textContent = u.rol;
}

// Configurar navegación del sidebar
function configurarNavegacion() {
    var items = document.querySelectorAll('.nav-item[data-section]');
    items.forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            var seccion = this.getAttribute('data-section');
            cambiarSeccion(seccion);
        });
    });
}

// Cambiar sección activa
function cambiarSeccion(seccion) {
    seccionActual = seccion;
    
    // Actualizar nav items
    document.querySelectorAll('.nav-item[data-section]').forEach(function(item) {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === seccion) {
            item.classList.add('active');
        }
    });
    
    // Mostrar sección correspondiente
    document.querySelectorAll('.content-section').forEach(function(s) {
        s.classList.remove('active');
    });
    
    var mapaSecciones = {
        'empresa': 'seccionEmpresa',
        'sucursales': 'seccionSucursales',
        'almacenes': 'seccionAlmacenes',
        'usuarios': 'seccionUsuarios',
        'impuestos': 'seccionImpuestos',
        'metodos-pago': 'seccionMetodosPago',
        'unidades': 'seccionUnidades',
        'categorias': 'seccionCategorias'
    };
    
    var seccionEl = document.getElementById(mapaSecciones[seccion]);
    if (seccionEl) {
        seccionEl.classList.add('active');
    }
    
    // Actualizar título
    var titulos = {
        'empresa': { titulo: 'Mi Empresa', subtitulo: 'Datos y configuración general' },
        'sucursales': { titulo: 'Sucursales', subtitulo: 'Administra tus puntos de venta' },
        'almacenes': { titulo: 'Almacenes', subtitulo: 'Gestiona tus almacenes e inventario' },
        'usuarios': { titulo: 'Usuarios', subtitulo: 'Administra el acceso al sistema' },
        'impuestos': { titulo: 'Impuestos', subtitulo: 'Configura tasas de impuestos' },
        'metodos-pago': { titulo: 'Métodos de Pago', subtitulo: 'Formas de pago disponibles' },
        'unidades': { titulo: 'Unidades de Medida', subtitulo: 'Unidades para tus productos' },
        'categorias': { titulo: 'Categorías', subtitulo: 'Organiza tus productos' }
    };
    
    if (titulos[seccion]) {
        document.getElementById('pageTitle').innerHTML = '<i class="fas fa-' + getIconoSeccion(seccion) + '"></i> ' + titulos[seccion].titulo;
        document.getElementById('pageSubtitle').textContent = titulos[seccion].subtitulo;
    }
    
    // Cargar datos de la sección
    cargarDatosSeccion(seccion);
}

function getIconoSeccion(seccion) {
    var iconos = {
        'empresa': 'store',
        'sucursales': 'map-marker-alt',
        'almacenes': 'warehouse',
        'usuarios': 'users',
        'impuestos': 'percent',
        'metodos-pago': 'credit-card',
        'unidades': 'balance-scale',
        'categorias': 'tags'
    };
    return iconos[seccion] || 'cog';
}

// ==================== CARGAR DATOS ====================
function cargarDatosIniciales() {
    cargarEmpresa();
    cargarSucursales();
}

function cargarDatosSeccion(seccion) {
    switch(seccion) {
        case 'empresa': cargarEmpresa(); break;
        case 'sucursales': cargarSucursales(); break;
        case 'almacenes': cargarAlmacenes(); break;
        case 'usuarios': cargarUsuarios(); break;
        case 'impuestos': cargarImpuestos(); break;
        case 'metodos-pago': cargarMetodosPago(); break;
        case 'unidades': cargarUnidades(); break;
        case 'categorias': cargarCategorias(); break;
    }
}

// ==================== EMPRESA ====================
function cargarEmpresa() {
    API.request('/empresas/' + API.getEmpresaID()).then(function(r) {
        if (r.success && r.empresa) {
            var e = r.empresa;
            document.getElementById('emp_nombre').value = e.nombre || '';
            document.getElementById('emp_rfc').value = e.rfc || '';
            document.getElementById('emp_telefono').value = e.telefono || '';
            document.getElementById('emp_direccion').value = e.direccion || '';
            document.getElementById('emp_email').value = e.email || '';
            document.getElementById('emp_web').value = e.sitio_web || '';
        }
    }).catch(function(e) { console.error(e); });
    
    // Cargar config
    API.request('/config-empresa/' + API.getEmpresaID()).then(function(r) {
        if (r.success && r.config) {
            var c = r.config;
            document.getElementById('cfg_moneda').value = c.moneda || 'MXN';
            document.getElementById('cfg_decimales').value = c.decimales_precio || '2';
            document.getElementById('cfg_precio_impuesto').value = c.precio_incluye_impuesto || 'Y';
            document.getElementById('cfg_inventario').checked = c.maneja_inventario === 'Y';
            document.getElementById('cfg_venta_sin_stock').checked = c.permitir_venta_sin_stock === 'Y';
        }
    }).catch(function(e) { console.error(e); });
}

document.getElementById('formEmpresa').addEventListener('submit', function(e) {
    e.preventDefault();
    var data = {
        nombre: document.getElementById('emp_nombre').value,
        rfc: document.getElementById('emp_rfc').value,
        telefono: document.getElementById('emp_telefono').value,
        direccion: document.getElementById('emp_direccion').value,
        email: document.getElementById('emp_email').value,
        sitio_web: document.getElementById('emp_web').value
    };
    
    API.request('/empresas/' + API.getEmpresaID(), 'PUT', data).then(function(r) {
        if (r.success) {
            mostrarToast('Empresa actualizada', 'success');
        } else {
            mostrarToast(r.error || 'Error al guardar', 'error');
        }
    }).catch(function() { mostrarToast('Error de conexión', 'error'); });
});

document.getElementById('formConfig').addEventListener('submit', function(e) {
    e.preventDefault();
    var data = {
        moneda: document.getElementById('cfg_moneda').value,
        decimales_precio: document.getElementById('cfg_decimales').value,
        precio_incluye_impuesto: document.getElementById('cfg_precio_impuesto').value,
        maneja_inventario: document.getElementById('cfg_inventario').checked ? 'Y' : 'N',
        permitir_venta_sin_stock: document.getElementById('cfg_venta_sin_stock').checked ? 'Y' : 'N'
    };
    
    API.request('/config-empresa/' + API.getEmpresaID(), 'PUT', data).then(function(r) {
        if (r.success) {
            mostrarToast('Configuración guardada', 'success');
        } else {
            mostrarToast(r.error || 'Error al guardar', 'error');
        }
    }).catch(function() { mostrarToast('Error de conexión', 'error'); });
});

// ==================== SUCURSALES ====================
function cargarSucursales() {
    API.request('/sucursales/' + API.getEmpresaID()).then(function(r) {
        if (r.success) {
            sucursales = r.sucursales || [];
            renderSucursales();
            actualizarSelectSucursales();
        }
    }).catch(function(e) { console.error(e); });
}

function renderSucursales() {
    var tbody = document.getElementById('tablaSucursales');
    if (sucursales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty">No hay sucursales registradas</td></tr>';
        return;
    }
    
    tbody.innerHTML = sucursales.map(function(s) {
        return '<tr>' +
            '<td><strong>' + s.nombre + '</strong></td>' +
            '<td>' + (s.direccion || '-') + '</td>' +
            '<td>' + (s.telefono || '-') + '</td>' +
            '<td><span class="badge badge-' + (s.activo === 'Y' ? 'success">Activo' : 'danger">Inactivo') + '</span></td>' +
            '<td class="actions">' +
                '<button class="btn-icon" onclick="editarSucursal(\'' + s.sucursal_id + '\')"><i class="fas fa-edit"></i></button>' +
            '</td>' +
        '</tr>';
    }).join('');
}

function actualizarSelectSucursales() {
    var selects = ['usr_sucursal', 'alm_sucursal'];
    selects.forEach(function(id) {
        var select = document.getElementById(id);
        if (select) {
            select.innerHTML = sucursales.filter(function(s) { return s.activo === 'Y'; }).map(function(s) {
                return '<option value="' + s.sucursal_id + '">' + s.nombre + '</option>';
            }).join('');
        }
    });
}

function abrirModalSucursal(id) {
    document.getElementById('modalSucursalTitulo').textContent = id ? 'Editar Sucursal' : 'Nueva Sucursal';
    document.getElementById('formSucursal').reset();
    document.getElementById('suc_id').value = id || '';
    abrirModal('modalSucursal');
}

function editarSucursal(id) {
    var s = sucursales.find(function(x) { return x.sucursal_id === id; });
    if (!s) return;
    
    document.getElementById('suc_id').value = s.sucursal_id;
    document.getElementById('suc_nombre').value = s.nombre;
    document.getElementById('suc_direccion').value = s.direccion || '';
    document.getElementById('suc_telefono').value = s.telefono || '';
    document.getElementById('suc_activo').value = s.activo;
    document.getElementById('modalSucursalTitulo').textContent = 'Editar Sucursal';
    abrirModal('modalSucursal');
}

function guardarSucursal(e) {
    e.preventDefault();
    var id = document.getElementById('suc_id').value;
    var data = {
        nombre: document.getElementById('suc_nombre').value,
        direccion: document.getElementById('suc_direccion').value,
        telefono: document.getElementById('suc_telefono').value,
        activo: document.getElementById('suc_activo').value,
        empresa_id: API.getEmpresaID()
    };
    
    var url = id ? '/sucursales/' + id : '/sucursales';
    var method = id ? 'PUT' : 'POST';
    
    API.request(url, method, data).then(function(r) {
        if (r.success) {
            mostrarToast('Sucursal guardada', 'success');
            cerrarModal('modalSucursal');
            cargarSucursales();
        } else {
            mostrarToast(r.error || 'Error', 'error');
        }
    }).catch(function() { mostrarToast('Error de conexión', 'error'); });
}

// ==================== ALMACENES ====================
function cargarAlmacenes() {
    API.request('/almacenes/' + API.getEmpresaID()).then(function(r) {
        if (r.success) {
            almacenes = r.almacenes || [];
            renderAlmacenes();
        }
    }).catch(function(e) { console.error(e); });
}

function renderAlmacenes() {
    var tbody = document.getElementById('tablaAlmacenes');
    if (almacenes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty">No hay almacenes registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = almacenes.map(function(a) {
        return '<tr>' +
            '<td><strong>' + a.nombre + '</strong></td>' +
            '<td>' + (a.sucursal_nombre || '-') + '</td>' +
            '<td><span class="badge badge-' + (a.es_punto_venta === 'Y' ? 'info">Sí' : 'secondary">No') + '</span></td>' +
            '<td><span class="badge badge-' + (a.activo === 'Y' ? 'success">Activo' : 'danger">Inactivo') + '</span></td>' +
            '<td class="actions">' +
                '<button class="btn-icon" onclick="editarAlmacen(\'' + a.almacen_id + '\')"><i class="fas fa-edit"></i></button>' +
            '</td>' +
        '</tr>';
    }).join('');
}

function abrirModalAlmacen() {
    document.getElementById('modalAlmacenTitulo').textContent = 'Nuevo Almacén';
    document.getElementById('formAlmacen').reset();
    document.getElementById('alm_id').value = '';
    abrirModal('modalAlmacen');
}

function editarAlmacen(id) {
    var a = almacenes.find(function(x) { return x.almacen_id === id; });
    if (!a) return;
    
    document.getElementById('alm_id').value = a.almacen_id;
    document.getElementById('alm_nombre').value = a.nombre;
    document.getElementById('alm_sucursal').value = a.sucursal_id;
    document.getElementById('alm_pv').value = a.es_punto_venta;
    document.getElementById('alm_activo').value = a.activo;
    document.getElementById('modalAlmacenTitulo').textContent = 'Editar Almacén';
    abrirModal('modalAlmacen');
}

function guardarAlmacen(e) {
    e.preventDefault();
    var id = document.getElementById('alm_id').value;
    var data = {
        nombre: document.getElementById('alm_nombre').value,
        sucursal_id: document.getElementById('alm_sucursal').value,
        es_punto_venta: document.getElementById('alm_pv').value,
        activo: document.getElementById('alm_activo').value,
        empresa_id: API.getEmpresaID()
    };
    
    var url = id ? '/almacenes/' + id : '/almacenes';
    var method = id ? 'PUT' : 'POST';
    
    API.request(url, method, data).then(function(r) {
        if (r.success) {
            mostrarToast('Almacén guardado', 'success');
            cerrarModal('modalAlmacen');
            cargarAlmacenes();
        } else {
            mostrarToast(r.error || 'Error', 'error');
        }
    }).catch(function() { mostrarToast('Error de conexión', 'error'); });
}

// ==================== USUARIOS ====================
function cargarUsuarios() {
    API.request('/usuarios/' + API.getEmpresaID()).then(function(r) {
        if (r.success) {
            usuarios = r.usuarios || [];
            renderUsuarios();
        }
    }).catch(function(e) { console.error(e); });
}

function renderUsuarios() {
    var tbody = document.getElementById('tablaUsuarios');
    if (usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty">No hay usuarios registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = usuarios.map(function(u) {
        return '<tr>' +
            '<td><strong>' + u.nombre + '</strong></td>' +
            '<td>' + u.email + '</td>' +
            '<td><span class="badge badge-info">' + u.rol + '</span></td>' +
            '<td>' + (u.sucursal_nombre || '-') + '</td>' +
            '<td><span class="badge badge-' + (u.activo === 'Y' ? 'success">Activo' : 'danger">Inactivo') + '</span></td>' +
            '<td class="actions">' +
                '<button class="btn-icon" onclick="editarUsuario(\'' + u.usuario_id + '\')"><i class="fas fa-edit"></i></button>' +
            '</td>' +
        '</tr>';
    }).join('');
}

function abrirModalUsuario() {
    document.getElementById('modalUsuarioTitulo').textContent = 'Nuevo Usuario';
    document.getElementById('formUsuario').reset();
    document.getElementById('usr_id').value = '';
    document.getElementById('usr_password').required = true;
    abrirModal('modalUsuario');
}

function editarUsuario(id) {
    var u = usuarios.find(function(x) { return x.usuario_id === id; });
    if (!u) return;
    
    document.getElementById('usr_id').value = u.usuario_id;
    document.getElementById('usr_nombre').value = u.nombre;
    document.getElementById('usr_email').value = u.email;
    document.getElementById('usr_password').value = '';
    document.getElementById('usr_password').required = false;
    document.getElementById('usr_rol').value = u.rol;
    document.getElementById('usr_sucursal').value = u.sucursal_id;
    document.getElementById('usr_activo').value = u.activo;
    document.getElementById('modalUsuarioTitulo').textContent = 'Editar Usuario';
    abrirModal('modalUsuario');
}

function guardarUsuario(e) {
    e.preventDefault();
    var id = document.getElementById('usr_id').value;
    var data = {
        nombre: document.getElementById('usr_nombre').value,
        email: document.getElementById('usr_email').value,
        rol: document.getElementById('usr_rol').value,
        sucursal_id: document.getElementById('usr_sucursal').value,
        activo: document.getElementById('usr_activo').value,
        empresa_id: API.getEmpresaID()
    };
    
    var pass = document.getElementById('usr_password').value;
    if (pass) data.contrasena = pass;
    
    var url = id ? '/usuarios/' + id : '/usuarios';
    var method = id ? 'PUT' : 'POST';
    
    API.request(url, method, data).then(function(r) {
        if (r.success) {
            mostrarToast('Usuario guardado', 'success');
            cerrarModal('modalUsuario');
            cargarUsuarios();
        } else {
            mostrarToast(r.error || 'Error', 'error');
        }
    }).catch(function() { mostrarToast('Error de conexión', 'error'); });
}

// ==================== IMPUESTOS ====================
function cargarImpuestos() {
    API.request('/impuestos/' + API.getEmpresaID()).then(function(r) {
        if (r.success) {
            impuestos = r.impuestos || [];
            renderImpuestos();
        }
    }).catch(function(e) { console.error(e); });
}

function renderImpuestos() {
    var tbody = document.getElementById('tablaImpuestos');
    if (impuestos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty">No hay impuestos registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = impuestos.map(function(i) {
        return '<tr>' +
            '<td><strong>' + i.nombre + '</strong></td>' +
            '<td>' + i.tasa + '%</td>' +
            '<td>' + (i.tipo || 'PORCENTAJE') + '</td>' +
            '<td><span class="badge badge-' + (i.activo === 'Y' ? 'success">Activo' : 'danger">Inactivo') + '</span></td>' +
            '<td class="actions">' +
                '<button class="btn-icon" onclick="editarImpuesto(\'' + i.impuesto_id + '\')"><i class="fas fa-edit"></i></button>' +
            '</td>' +
        '</tr>';
    }).join('');
}

function abrirModalImpuesto() {
    document.getElementById('modalImpuestoTitulo').textContent = 'Nuevo Impuesto';
    document.getElementById('formImpuesto').reset();
    document.getElementById('imp_id').value = '';
    abrirModal('modalImpuesto');
}

function editarImpuesto(id) {
    var i = impuestos.find(function(x) { return x.impuesto_id === id; });
    if (!i) return;
    
    document.getElementById('imp_id').value = i.impuesto_id;
    document.getElementById('imp_nombre').value = i.nombre;
    document.getElementById('imp_tasa').value = i.tasa;
    document.getElementById('imp_tipo').value = i.tipo || 'PORCENTAJE';
    document.getElementById('imp_activo').value = i.activo;
    document.getElementById('modalImpuestoTitulo').textContent = 'Editar Impuesto';
    abrirModal('modalImpuesto');
}

function guardarImpuesto(e) {
    e.preventDefault();
    var id = document.getElementById('imp_id').value;
    var data = {
        nombre: document.getElementById('imp_nombre').value,
        tasa: document.getElementById('imp_tasa').value,
        tipo: document.getElementById('imp_tipo').value,
        activo: document.getElementById('imp_activo').value,
        empresa_id: API.getEmpresaID()
    };
    
    var url = id ? '/impuestos/' + id : '/impuestos';
    var method = id ? 'PUT' : 'POST';
    
    API.request(url, method, data).then(function(r) {
        if (r.success) {
            mostrarToast('Impuesto guardado', 'success');
            cerrarModal('modalImpuesto');
            cargarImpuestos();
        } else {
            mostrarToast(r.error || 'Error', 'error');
        }
    }).catch(function() { mostrarToast('Error de conexión', 'error'); });
}

// ==================== MÉTODOS DE PAGO ====================
function cargarMetodosPago() {
    API.request('/metodos-pago/' + API.getEmpresaID()).then(function(r) {
        if (r.success) {
            metodosPago = r.metodos || [];
            renderMetodosPago();
        }
    }).catch(function(e) { console.error(e); });
}

function renderMetodosPago() {
    var tbody = document.getElementById('tablaMetodosPago');
    if (metodosPago.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty">No hay métodos de pago registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = metodosPago.map(function(m) {
        return '<tr>' +
            '<td><strong>' + m.nombre + '</strong></td>' +
            '<td>' + (m.tipo || '-') + '</td>' +
            '<td>' + (m.requiere_referencia === 'Y' ? 'Sí' : 'No') + '</td>' +
            '<td><span class="badge badge-' + (m.activo === 'Y' ? 'success">Activo' : 'danger">Inactivo') + '</span></td>' +
            '<td class="actions">' +
                '<button class="btn-icon" onclick="editarMetodoPago(\'' + m.metodo_pago_id + '\')"><i class="fas fa-edit"></i></button>' +
            '</td>' +
        '</tr>';
    }).join('');
}

function abrirModalMetodoPago() {
    document.getElementById('modalMetodoPagoTitulo').textContent = 'Nuevo Método de Pago';
    document.getElementById('formMetodoPago').reset();
    document.getElementById('mp_id').value = '';
    abrirModal('modalMetodoPago');
}

function editarMetodoPago(id) {
    var m = metodosPago.find(function(x) { return x.metodo_pago_id === id; });
    if (!m) return;
    
    document.getElementById('mp_id').value = m.metodo_pago_id;
    document.getElementById('mp_nombre').value = m.nombre;
    document.getElementById('mp_tipo').value = m.tipo || 'EFECTIVO';
    document.getElementById('mp_referencia').value = m.requiere_referencia || 'N';
    document.getElementById('mp_activo').value = m.activo;
    document.getElementById('modalMetodoPagoTitulo').textContent = 'Editar Método de Pago';
    abrirModal('modalMetodoPago');
}

function guardarMetodoPago(e) {
    e.preventDefault();
    var id = document.getElementById('mp_id').value;
    var data = {
        nombre: document.getElementById('mp_nombre').value,
        tipo: document.getElementById('mp_tipo').value,
        requiere_referencia: document.getElementById('mp_referencia').value,
        activo: document.getElementById('mp_activo').value,
        empresa_id: API.getEmpresaID()
    };
    
    var url = id ? '/metodos-pago/' + id : '/metodos-pago';
    var method = id ? 'PUT' : 'POST';
    
    API.request(url, method, data).then(function(r) {
        if (r.success) {
            mostrarToast('Método guardado', 'success');
            cerrarModal('modalMetodoPago');
            cargarMetodosPago();
        } else {
            mostrarToast(r.error || 'Error', 'error');
        }
    }).catch(function() { mostrarToast('Error de conexión', 'error'); });
}

// ==================== UNIDADES ====================
function cargarUnidades() {
    API.request('/unidades/' + API.getEmpresaID()).then(function(r) {
        if (r.success) {
            unidades = r.unidades || [];
            renderUnidades();
        }
    }).catch(function(e) { console.error(e); });
}

function renderUnidades() {
    var tbody = document.getElementById('tablaUnidades');
    if (unidades.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty">No hay unidades registradas</td></tr>';
        return;
    }
    
    tbody.innerHTML = unidades.map(function(u) {
        return '<tr>' +
            '<td><code>' + u.codigo + '</code></td>' +
            '<td><strong>' + u.nombre + '</strong></td>' +
            '<td>' + (u.abreviatura || u.codigo) + '</td>' +
            '<td>' + (u.tipo || 'UNIDAD') + '</td>' +
            '<td class="actions">' +
                '<button class="btn-icon" onclick="editarUnidad(\'' + u.unidad_id + '\')"><i class="fas fa-edit"></i></button>' +
            '</td>' +
        '</tr>';
    }).join('');
}

function abrirModalUnidad() {
    document.getElementById('modalUnidadTitulo').textContent = 'Nueva Unidad';
    document.getElementById('formUnidad').reset();
    document.getElementById('uni_id').value = '';
    abrirModal('modalUnidad');
}

function editarUnidad(id) {
    var u = unidades.find(function(x) { return x.unidad_id === id; });
    if (!u) return;
    
    document.getElementById('uni_id').value = u.unidad_id;
    document.getElementById('uni_codigo').value = u.codigo;
    document.getElementById('uni_nombre').value = u.nombre;
    document.getElementById('uni_abrev').value = u.abreviatura || '';
    document.getElementById('uni_tipo').value = u.tipo || 'UNIDAD';
    document.getElementById('modalUnidadTitulo').textContent = 'Editar Unidad';
    abrirModal('modalUnidad');
}

function guardarUnidad(e) {
    e.preventDefault();
    var id = document.getElementById('uni_id').value;
    var data = {
        codigo: document.getElementById('uni_codigo').value.toUpperCase(),
        nombre: document.getElementById('uni_nombre').value,
        abreviatura: document.getElementById('uni_abrev').value,
        tipo: document.getElementById('uni_tipo').value,
        empresa_id: API.getEmpresaID()
    };
    
    var url = id ? '/unidades/' + id : '/unidades';
    var method = id ? 'PUT' : 'POST';
    
    API.request(url, method, data).then(function(r) {
        if (r.success) {
            mostrarToast('Unidad guardada', 'success');
            cerrarModal('modalUnidad');
            cargarUnidades();
        } else {
            mostrarToast(r.error || 'Error', 'error');
        }
    }).catch(function() { mostrarToast('Error de conexión', 'error'); });
}

// ==================== CATEGORÍAS ====================
function cargarCategorias() {
    API.request('/categorias/' + API.getEmpresaID()).then(function(r) {
        if (r.success) {
            categorias = r.categorias || [];
            renderCategorias();
        }
    }).catch(function(e) { console.error(e); });
}

function renderCategorias() {
    var tbody = document.getElementById('tablaCategorias');
    if (categorias.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty">No hay categorías registradas</td></tr>';
        return;
    }
    
    tbody.innerHTML = categorias.map(function(c) {
        return '<tr>' +
            '<td><strong>' + c.nombre + '</strong></td>' +
            '<td>' + (c.descripcion || '-') + '</td>' +
            '<td>' + (c.total_productos || 0) + '</td>' +
            '<td><span class="badge badge-' + (c.activo === 'Y' ? 'success">Activo' : 'danger">Inactivo') + '</span></td>' +
            '<td class="actions">' +
                '<button class="btn-icon" onclick="editarCategoria(\'' + c.categoria_id + '\')"><i class="fas fa-edit"></i></button>' +
            '</td>' +
        '</tr>';
    }).join('');
}

function abrirModalCategoria() {
    document.getElementById('modalCategoriaTitulo').textContent = 'Nueva Categoría';
    document.getElementById('formCategoria').reset();
    document.getElementById('cat_id').value = '';
    abrirModal('modalCategoria');
}

function editarCategoria(id) {
    var c = categorias.find(function(x) { return x.categoria_id === id; });
    if (!c) return;
    
    document.getElementById('cat_id').value = c.categoria_id;
    document.getElementById('cat_nombre').value = c.nombre;
    document.getElementById('cat_descripcion').value = c.descripcion || '';
    document.getElementById('cat_activo').value = c.activo;
    document.getElementById('modalCategoriaTitulo').textContent = 'Editar Categoría';
    abrirModal('modalCategoria');
}

function guardarCategoria(e) {
    e.preventDefault();
    var id = document.getElementById('cat_id').value;
    var data = {
        nombre: document.getElementById('cat_nombre').value,
        descripcion: document.getElementById('cat_descripcion').value,
        activo: document.getElementById('cat_activo').value,
        empresa_id: API.getEmpresaID()
    };
    
    var url = id ? '/categorias/' + id : '/categorias';
    var method = id ? 'PUT' : 'POST';
    
    API.request(url, method, data).then(function(r) {
        if (r.success) {
            mostrarToast('Categoría guardada', 'success');
            cerrarModal('modalCategoria');
            cargarCategorias();
        } else {
            mostrarToast(r.error || 'Error', 'error');
        }
    }).catch(function() { mostrarToast('Error de conexión', 'error'); });
}

// ==================== UTILIDADES ====================
function abrirModal(id) {
    document.getElementById(id).classList.add('active');
}

function cerrarModal(id) {
    document.getElementById(id).classList.remove('active');
}

function mostrarToast(mensaje, tipo) {
    var toast = document.getElementById('toast');
    toast.textContent = mensaje;
    toast.className = 'toast ' + (tipo || '');
    toast.classList.add('show');
    
    setTimeout(function() {
        toast.classList.remove('show');
    }, 3000);
}

// Cerrar modales con ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(function(m) {
            m.classList.remove('active');
        });
    }
});

// Cerrar modal al click fuera
document.querySelectorAll('.modal-overlay').forEach(function(overlay) {
    overlay.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });
});
