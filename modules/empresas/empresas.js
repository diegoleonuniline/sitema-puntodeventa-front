// ==================== CAFI EMPRESAS/CONFIG - JS COMPLETO ====================

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
    configurarEventos();
    cargarDatosIniciales();
});

function cargarUsuarioUI() {
    var u = API.usuario;
    if (!u) return;
    var iniciales = u.nombre.split(' ').map(function(n) { return n.charAt(0); }).join('').substring(0, 2);
    document.getElementById('userAvatar').textContent = iniciales.toUpperCase();
    document.getElementById('userName').textContent = u.nombre;
    document.getElementById('userRol').textContent = u.rol;
}

function configurarNavegacion() {
    document.querySelectorAll('.nav-item[data-section]').forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            cambiarSeccion(this.getAttribute('data-section'));
        });
    });
    
    // Menú móvil
    var btnMenu = document.getElementById('btnMenu');
    if (btnMenu) {
        btnMenu.addEventListener('click', function() {
            document.getElementById('sidebar').classList.toggle('open');
        });
    }
}

function configurarEventos() {
    // Color picker sync
    var catColor = document.getElementById('cat_color');
    var catColorText = document.getElementById('cat_color_text');
    if (catColor && catColorText) {
        catColor.addEventListener('input', function() { catColorText.value = this.value; });
        catColorText.addEventListener('input', function() { catColor.value = this.value; });
    }
}

function cambiarSeccion(seccion) {
    seccionActual = seccion;
    
    document.querySelectorAll('.nav-item[data-section]').forEach(function(item) {
        item.classList.toggle('active', item.getAttribute('data-section') === seccion);
    });
    
    document.querySelectorAll('.content-section').forEach(function(s) { s.classList.remove('active'); });
    
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
    
    var titulos = {
        'empresa': { t: 'Mi Empresa', s: 'Datos y configuración', i: 'building' },
        'sucursales': { t: 'Sucursales', s: 'Administra tus puntos de venta', i: 'map-marker-alt' },
        'almacenes': { t: 'Almacenes', s: 'Gestiona inventarios', i: 'warehouse' },
        'usuarios': { t: 'Usuarios', s: 'Control de acceso', i: 'users' },
        'impuestos': { t: 'Impuestos', s: 'Tasas de impuestos', i: 'percent' },
        'metodos-pago': { t: 'Métodos de Pago', s: 'Formas de pago', i: 'credit-card' },
        'unidades': { t: 'Unidades de Medida', s: 'Unidades para productos', i: 'balance-scale' },
        'categorias': { t: 'Categorías', s: 'Organiza productos', i: 'tags' }
    };
    
    var sec = document.getElementById(mapaSecciones[seccion]);
    if (sec) sec.classList.add('active');
    
    if (titulos[seccion]) {
        document.getElementById('pageTitle').innerHTML = '<i class="fas fa-' + titulos[seccion].i + '"></i> ' + titulos[seccion].t;
        document.getElementById('pageSubtitle').textContent = titulos[seccion].s;
    }
    
    cargarDatosSeccion(seccion);
    document.getElementById('sidebar').classList.remove('open');
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
            // Datos generales
            document.getElementById('emp_nombre').value = e.nombre || '';
            document.getElementById('emp_nombre_comercial').value = e.nombre_comercial || '';
            document.getElementById('emp_rfc').value = e.rfc || '';
            document.getElementById('emp_regimen_fiscal').value = e.regimen_fiscal || '';
            document.getElementById('emp_direccion').value = e.direccion || '';
            document.getElementById('emp_ciudad').value = e.ciudad || '';
            document.getElementById('emp_estado').value = e.estado || '';
            document.getElementById('emp_codigo_postal').value = e.codigo_postal || '';
            document.getElementById('emp_pais_id').value = e.pais_id || 'MX';
            document.getElementById('emp_telefono').value = e.telefono || '';
            document.getElementById('emp_email').value = e.email || '';
            document.getElementById('emp_website').value = e.website || '';
            document.getElementById('emp_logo_url').value = e.logo_url || '';
            // Regional
            document.getElementById('emp_moneda_id').value = e.moneda_id || 'MXN';
            document.getElementById('emp_zona_horaria').value = e.zona_horaria || 'America/Mexico_City';
            document.getElementById('emp_activa').checked = e.activa === 'Y';
            document.getElementById('emp_fecha_vencimiento').value = e.fecha_vencimiento ? e.fecha_vencimiento.substring(0,10) : '';
            // Puntos
            document.getElementById('emp_puntos_activo').checked = e.puntos_activo === 'Y';
            document.getElementById('emp_puntos_por_peso').value = e.puntos_por_peso || 10;
            document.getElementById('emp_punto_valor_redencion').value = e.punto_valor_redencion || 0.50;
            document.getElementById('emp_puntos_minimo_redimir').value = e.puntos_minimo_redimir || 100;
        }
    }).catch(function(e) { console.error('Error cargando empresa:', e); });
}

// Form Empresa
document.getElementById('formEmpresa').addEventListener('submit', function(e) {
    e.preventDefault();
    var data = {
        nombre: document.getElementById('emp_nombre').value,
        nombre_comercial: document.getElementById('emp_nombre_comercial').value,
        rfc: document.getElementById('emp_rfc').value.toUpperCase(),
        regimen_fiscal: document.getElementById('emp_regimen_fiscal').value,
        direccion: document.getElementById('emp_direccion').value,
        ciudad: document.getElementById('emp_ciudad').value,
        estado: document.getElementById('emp_estado').value,
        codigo_postal: document.getElementById('emp_codigo_postal').value,
        pais_id: document.getElementById('emp_pais_id').value,
        telefono: document.getElementById('emp_telefono').value,
        email: document.getElementById('emp_email').value,
        website: document.getElementById('emp_website').value,
        logo_url: document.getElementById('emp_logo_url').value
    };
    API.request('/empresas/' + API.getEmpresaID(), 'PUT', data).then(function(r) {
        mostrarToast(r.success ? 'Empresa actualizada' : (r.error || 'Error'), r.success ? 'success' : 'error');
    }).catch(function() { mostrarToast('Error de conexión', 'error'); });
});

// Form Regional
document.getElementById('formRegional').addEventListener('submit', function(e) {
    e.preventDefault();
    var data = {
        moneda_id: document.getElementById('emp_moneda_id').value,
        zona_horaria: document.getElementById('emp_zona_horaria').value,
        activa: document.getElementById('emp_activa').checked ? 'Y' : 'N'
    };
    API.request('/empresas/' + API.getEmpresaID(), 'PUT', data).then(function(r) {
        mostrarToast(r.success ? 'Configuración guardada' : (r.error || 'Error'), r.success ? 'success' : 'error');
    }).catch(function() { mostrarToast('Error de conexión', 'error'); });
});

// Form Puntos
document.getElementById('formPuntos').addEventListener('submit', function(e) {
    e.preventDefault();
    var data = {
        puntos_activo: document.getElementById('emp_puntos_activo').checked ? 'Y' : 'N',
        puntos_por_peso: document.getElementById('emp_puntos_por_peso').value,
        punto_valor_redencion: document.getElementById('emp_punto_valor_redencion').value,
        puntos_minimo_redimir: document.getElementById('emp_puntos_minimo_redimir').value
    };
    API.request('/empresas/' + API.getEmpresaID(), 'PUT', data).then(function(r) {
        mostrarToast(r.success ? 'Puntos guardados' : (r.error || 'Error'), r.success ? 'success' : 'error');
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
        tbody.innerHTML = '<tr><td colspan="8" class="empty">No hay sucursales</td></tr>';
        return;
    }
    tbody.innerHTML = sucursales.map(function(s) {
        var horario = (s.horario_apertura && s.horario_cierre) ? s.horario_apertura.substring(0,5) + '-' + s.horario_cierre.substring(0,5) : '-';
        return '<tr>' +
            '<td><code>' + (s.codigo || '-') + '</code></td>' +
            '<td><strong>' + s.nombre + '</strong></td>' +
            '<td>' + (s.tipo || 'TIENDA') + '</td>' +
            '<td>' + (s.ciudad || '-') + '</td>' +
            '<td>' + (s.responsable || '-') + '</td>' +
            '<td>' + horario + '</td>' +
            '<td><span class="badge badge-' + (s.activa === 'Y' ? 'success">Activa' : 'danger">Inactiva') + '</span></td>' +
            '<td class="actions">' +
                '<button class="btn-icon" onclick="editarSucursal(\'' + s.sucursal_id + '\')" title="Editar"><i class="fas fa-edit"></i></button>' +
            '</td></tr>';
    }).join('');
}

function actualizarSelectSucursales() {
    var opts = sucursales.filter(function(s) { return s.activa === 'Y'; }).map(function(s) {
        return '<option value="' + s.sucursal_id + '">' + s.nombre + '</option>';
    }).join('');
    ['usr_sucursal_id', 'alm_sucursal_id'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.innerHTML = opts;
    });
}

function abrirModalSucursal() {
    document.getElementById('modalSucursalTitulo').textContent = 'Nueva Sucursal';
    document.getElementById('formSucursal').reset();
    document.getElementById('suc_id').value = '';
    document.getElementById('suc_permite_venta').checked = true;
    document.getElementById('suc_permite_compra').checked = true;
    document.getElementById('suc_permite_traspaso').checked = true;
    document.getElementById('suc_activa').checked = true;
    abrirModal('modalSucursal');
}

function editarSucursal(id) {
    var s = sucursales.find(function(x) { return x.sucursal_id === id; });
    if (!s) return;
    document.getElementById('modalSucursalTitulo').textContent = 'Editar Sucursal';
    document.getElementById('suc_id').value = s.sucursal_id;
    document.getElementById('suc_codigo').value = s.codigo || '';
    document.getElementById('suc_nombre').value = s.nombre;
    document.getElementById('suc_tipo').value = s.tipo || 'TIENDA';
    document.getElementById('suc_responsable').value = s.responsable || '';
    document.getElementById('suc_direccion').value = s.direccion || '';
    document.getElementById('suc_colonia').value = s.colonia || '';
    document.getElementById('suc_ciudad').value = s.ciudad || '';
    document.getElementById('suc_estado').value = s.estado || '';
    document.getElementById('suc_codigo_postal').value = s.codigo_postal || '';
    document.getElementById('suc_latitud').value = s.latitud || '';
    document.getElementById('suc_longitud').value = s.longitud || '';
    document.getElementById('suc_telefono').value = s.telefono || '';
    document.getElementById('suc_email').value = s.email || '';
    document.getElementById('suc_horario_apertura').value = s.horario_apertura ? s.horario_apertura.substring(0,5) : '09:00';
    document.getElementById('suc_horario_cierre').value = s.horario_cierre ? s.horario_cierre.substring(0,5) : '20:00';
    document.getElementById('suc_dias_operacion').value = s.dias_operacion || 'L,M,X,J,V,S';
    document.getElementById('suc_permite_venta').checked = s.permite_venta === 'Y';
    document.getElementById('suc_permite_compra').checked = s.permite_compra === 'Y';
    document.getElementById('suc_permite_traspaso').checked = s.permite_traspaso === 'Y';
    document.getElementById('suc_activa').checked = s.activa === 'Y';
    abrirModal('modalSucursal');
}

function guardarSucursal(e) {
    e.preventDefault();
    var id = document.getElementById('suc_id').value;
    var data = {
        empresa_id: API.getEmpresaID(),
        codigo: document.getElementById('suc_codigo').value,
        nombre: document.getElementById('suc_nombre').value,
        tipo: document.getElementById('suc_tipo').value,
        responsable: document.getElementById('suc_responsable').value,
        direccion: document.getElementById('suc_direccion').value,
        colonia: document.getElementById('suc_colonia').value,
        ciudad: document.getElementById('suc_ciudad').value,
        estado: document.getElementById('suc_estado').value,
        codigo_postal: document.getElementById('suc_codigo_postal').value,
        latitud: document.getElementById('suc_latitud').value || null,
        longitud: document.getElementById('suc_longitud').value || null,
        telefono: document.getElementById('suc_telefono').value,
        email: document.getElementById('suc_email').value,
        horario_apertura: document.getElementById('suc_horario_apertura').value,
        horario_cierre: document.getElementById('suc_horario_cierre').value,
        dias_operacion: document.getElementById('suc_dias_operacion').value,
        permite_venta: document.getElementById('suc_permite_venta').checked ? 'Y' : 'N',
        permite_compra: document.getElementById('suc_permite_compra').checked ? 'Y' : 'N',
        permite_traspaso: document.getElementById('suc_permite_traspaso').checked ? 'Y' : 'N',
        activa: document.getElementById('suc_activa').checked ? 'Y' : 'N'
    };
    var url = id ? '/sucursales/' + id : '/sucursales';
    API.request(url, id ? 'PUT' : 'POST', data).then(function(r) {
        if (r.success) {
            mostrarToast('Sucursal guardada', 'success');
            cerrarModal('modalSucursal');
            cargarSucursales();
        } else { mostrarToast(r.error || 'Error', 'error'); }
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
        tbody.innerHTML = '<tr><td colspan="8" class="empty">No hay almacenes</td></tr>';
        return;
    }
    tbody.innerHTML = almacenes.map(function(a) {
        return '<tr>' +
            '<td><code>' + (a.codigo || '-') + '</code></td>' +
            '<td><strong>' + a.nombre + '</strong></td>' +
            '<td>' + (a.sucursal_nombre || '-') + '</td>' +
            '<td>' + (a.tipo || 'PRINCIPAL') + '</td>' +
            '<td><span class="badge badge-' + (a.es_punto_venta === 'Y' ? 'info">Sí' : 'secondary">No') + '</span></td>' +
            '<td><span class="badge badge-' + (a.permite_negativo === 'Y' ? 'warning">Sí' : 'secondary">No') + '</span></td>' +
            '<td><span class="badge badge-' + (a.activo === 'Y' ? 'success">Activo' : 'danger">Inactivo') + '</span></td>' +
            '<td class="actions"><button class="btn-icon" onclick="editarAlmacen(\'' + a.almacen_id + '\')"><i class="fas fa-edit"></i></button></td></tr>';
    }).join('');
}

function abrirModalAlmacen() {
    document.getElementById('modalAlmacenTitulo').textContent = 'Nuevo Almacén';
    document.getElementById('formAlmacen').reset();
    document.getElementById('alm_id').value = '';
    document.getElementById('alm_activo').checked = true;
    abrirModal('modalAlmacen');
}

function editarAlmacen(id) {
    var a = almacenes.find(function(x) { return x.almacen_id === id; });
    if (!a) return;
    document.getElementById('modalAlmacenTitulo').textContent = 'Editar Almacén';
    document.getElementById('alm_id').value = a.almacen_id;
    document.getElementById('alm_codigo').value = a.codigo || '';
    document.getElementById('alm_nombre').value = a.nombre;
    document.getElementById('alm_sucursal_id').value = a.sucursal_id;
    document.getElementById('alm_tipo').value = a.tipo || 'PRINCIPAL';
    document.getElementById('alm_es_punto_venta').checked = a.es_punto_venta === 'Y';
    document.getElementById('alm_permite_negativo').checked = a.permite_negativo === 'Y';
    document.getElementById('alm_activo').checked = a.activo === 'Y';
    abrirModal('modalAlmacen');
}

function guardarAlmacen(e) {
    e.preventDefault();
    var id = document.getElementById('alm_id').value;
    var data = {
        empresa_id: API.getEmpresaID(),
        sucursal_id: document.getElementById('alm_sucursal_id').value,
        codigo: document.getElementById('alm_codigo').value,
        nombre: document.getElementById('alm_nombre').value,
        tipo: document.getElementById('alm_tipo').value,
        es_punto_venta: document.getElementById('alm_es_punto_venta').checked ? 'Y' : 'N',
        permite_negativo: document.getElementById('alm_permite_negativo').checked ? 'Y' : 'N',
        activo: document.getElementById('alm_activo').checked ? 'Y' : 'N'
    };
    API.request(id ? '/almacenes/' + id : '/almacenes', id ? 'PUT' : 'POST', data).then(function(r) {
        if (r.success) {
            mostrarToast('Almacén guardado', 'success');
            cerrarModal('modalAlmacen');
            cargarAlmacenes();
        } else { mostrarToast(r.error || 'Error', 'error'); }
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
        tbody.innerHTML = '<tr><td colspan="7" class="empty">No hay usuarios</td></tr>';
        return;
    }
    tbody.innerHTML = usuarios.map(function(u) {
        var acceso = u.ultimo_acceso ? new Date(u.ultimo_acceso).toLocaleDateString('es-MX') : 'Nunca';
        return '<tr>' +
            '<td><strong>' + u.nombre + '</strong></td>' +
            '<td>' + u.email + '</td>' +
            '<td><span class="badge badge-info">' + u.rol + '</span></td>' +
            '<td>' + (u.sucursal_nombre || '-') + '</td>' +
            '<td>' + acceso + '</td>' +
            '<td><span class="badge badge-' + (u.activo === 'Y' ? 'success">Activo' : 'danger">Inactivo') + '</span>' +
                (u.bloqueado === 'Y' ? ' <span class="badge badge-warning">Bloqueado</span>' : '') + '</td>' +
            '<td class="actions"><button class="btn-icon" onclick="editarUsuario(\'' + u.usuario_id + '\')"><i class="fas fa-edit"></i></button></td></tr>';
    }).join('');
}

function abrirModalUsuario() {
    document.getElementById('modalUsuarioTitulo').textContent = 'Nuevo Usuario';
    document.getElementById('formUsuario').reset();
    document.getElementById('usr_id').value = '';
    document.getElementById('usr_contrasena').required = true;
    document.getElementById('lbl_pass').textContent = 'Contraseña *';
    document.getElementById('usr_activo').checked = true;
    document.getElementById('usr_bloqueado').checked = false;
    abrirModal('modalUsuario');
}

function editarUsuario(id) {
    var u = usuarios.find(function(x) { return x.usuario_id === id; });
    if (!u) return;
    document.getElementById('modalUsuarioTitulo').textContent = 'Editar Usuario';
    document.getElementById('usr_id').value = u.usuario_id;
    document.getElementById('usr_nombre').value = u.nombre;
    document.getElementById('usr_email').value = u.email;
    document.getElementById('usr_contrasena').value = '';
    document.getElementById('usr_contrasena').required = false;
    document.getElementById('lbl_pass').textContent = 'Contraseña (dejar vacío para no cambiar)';
    document.getElementById('usr_avatar_url').value = u.avatar_url || '';
    document.getElementById('usr_rol').value = u.rol;
    document.getElementById('usr_sucursal_id').value = u.sucursal_id;
    document.getElementById('usr_sucursales_permitidas').value = u.sucursales_permitidas || '';
    document.getElementById('usr_activo').checked = u.activo === 'Y';
    document.getElementById('usr_bloqueado').checked = u.bloqueado === 'Y';
    document.getElementById('usr_intentos_fallidos').value = u.intentos_fallidos || 0;
    abrirModal('modalUsuario');
}

function guardarUsuario(e) {
    e.preventDefault();
    var id = document.getElementById('usr_id').value;
    var data = {
        empresa_id: API.getEmpresaID(),
        sucursal_id: document.getElementById('usr_sucursal_id').value,
        nombre: document.getElementById('usr_nombre').value,
        email: document.getElementById('usr_email').value,
        avatar_url: document.getElementById('usr_avatar_url').value,
        rol: document.getElementById('usr_rol').value,
        sucursales_permitidas: document.getElementById('usr_sucursales_permitidas').value,
        activo: document.getElementById('usr_activo').checked ? 'Y' : 'N',
        bloqueado: document.getElementById('usr_bloqueado').checked ? 'Y' : 'N'
    };
    var pass = document.getElementById('usr_contrasena').value;
    if (pass) data.contrasena = pass;
    
    API.request(id ? '/usuarios/' + id : '/usuarios', id ? 'PUT' : 'POST', data).then(function(r) {
        if (r.success) {
            mostrarToast('Usuario guardado', 'success');
            cerrarModal('modalUsuario');
            cargarUsuarios();
        } else { mostrarToast(r.error || 'Error', 'error'); }
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
        tbody.innerHTML = '<tr><td colspan="8" class="empty">No hay impuestos</td></tr>';
        return;
    }
    tbody.innerHTML = impuestos.map(function(i) {
        var valorStr = i.tipo === 'PORCENTAJE' ? i.valor + '%' : '$' + i.valor;
        return '<tr>' +
            '<td><strong>' + i.nombre + '</strong></td>' +
            '<td>' + i.tipo + '</td>' +
            '<td>' + valorStr + '</td>' +
            '<td>' + (i.incluido_en_precio === 'Y' ? '✓' : '-') + '</td>' +
            '<td>' + (i.aplica_compras === 'Y' ? '✓' : '-') + '</td>' +
            '<td>' + (i.aplica_ventas === 'Y' ? '✓' : '-') + '</td>' +
            '<td><span class="badge badge-' + (i.activo === 'Y' ? 'success">Activo' : 'danger">Inactivo') + '</span></td>' +
            '<td class="actions"><button class="btn-icon" onclick="editarImpuesto(\'' + i.impuesto_id + '\')"><i class="fas fa-edit"></i></button></td></tr>';
    }).join('');
}

function abrirModalImpuesto() {
    document.getElementById('modalImpuestoTitulo').textContent = 'Nuevo Impuesto';
    document.getElementById('formImpuesto').reset();
    document.getElementById('imp_id').value = '';
    document.getElementById('imp_incluido_en_precio').checked = true;
    document.getElementById('imp_aplica_compras').checked = true;
    document.getElementById('imp_aplica_ventas').checked = true;
    document.getElementById('imp_activo').checked = true;
    abrirModal('modalImpuesto');
}

function editarImpuesto(id) {
    var i = impuestos.find(function(x) { return x.impuesto_id === id; });
    if (!i) return;
    document.getElementById('modalImpuestoTitulo').textContent = 'Editar Impuesto';
    document.getElementById('imp_id').value = i.impuesto_id;
    document.getElementById('imp_nombre').value = i.nombre;
    document.getElementById('imp_tipo').value = i.tipo;
    document.getElementById('imp_valor').value = i.valor;
    document.getElementById('imp_cuenta_contable').value = i.cuenta_contable || '';
    document.getElementById('imp_incluido_en_precio').checked = i.incluido_en_precio === 'Y';
    document.getElementById('imp_aplica_compras').checked = i.aplica_compras === 'Y';
    document.getElementById('imp_aplica_ventas').checked = i.aplica_ventas === 'Y';
    document.getElementById('imp_activo').checked = i.activo === 'Y';
    abrirModal('modalImpuesto');
}

function guardarImpuesto(e) {
    e.preventDefault();
    var id = document.getElementById('imp_id').value;
    var data = {
        empresa_id: API.getEmpresaID(),
        nombre: document.getElementById('imp_nombre').value,
        tipo: document.getElementById('imp_tipo').value,
        valor: document.getElementById('imp_valor').value,
        cuenta_contable: document.getElementById('imp_cuenta_contable').value,
        incluido_en_precio: document.getElementById('imp_incluido_en_precio').checked ? 'Y' : 'N',
        aplica_compras: document.getElementById('imp_aplica_compras').checked ? 'Y' : 'N',
        aplica_ventas: document.getElementById('imp_aplica_ventas').checked ? 'Y' : 'N',
        activo: document.getElementById('imp_activo').checked ? 'Y' : 'N'
    };
    API.request(id ? '/impuestos/' + id : '/impuestos', id ? 'PUT' : 'POST', data).then(function(r) {
        if (r.success) {
            mostrarToast('Impuesto guardado', 'success');
            cerrarModal('modalImpuesto');
            cargarImpuestos();
        } else { mostrarToast(r.error || 'Error', 'error'); }
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
        tbody.innerHTML = '<tr><td colspan="9" class="empty">No hay métodos de pago</td></tr>';
        return;
    }
    tbody.innerHTML = metodosPago.map(function(m) {
        return '<tr>' +
            '<td>' + (m.orden || 0) + '</td>' +
            '<td><strong>' + m.nombre + '</strong></td>' +
            '<td>' + m.tipo + '</td>' +
            '<td>' + (m.requiere_referencia === 'Y' ? '✓' : '-') + '</td>' +
            '<td>' + (m.permite_cambio === 'Y' ? '✓' : '-') + '</td>' +
            '<td>' + (m.comision_porcentaje || 0) + '%</td>' +
            '<td>$' + (m.comision_fija || 0) + '</td>' +
            '<td><span class="badge badge-' + (m.activo === 'Y' ? 'success">Activo' : 'danger">Inactivo') + '</span></td>' +
            '<td class="actions"><button class="btn-icon" onclick="editarMetodoPago(\'' + m.metodo_pago_id + '\')"><i class="fas fa-edit"></i></button></td></tr>';
    }).join('');
}

function abrirModalMetodoPago() {
    document.getElementById('modalMetodoPagoTitulo').textContent = 'Nuevo Método';
    document.getElementById('formMetodoPago').reset();
    document.getElementById('mp_id').value = '';
    document.getElementById('mp_activo').checked = true;
    abrirModal('modalMetodoPago');
}

function editarMetodoPago(id) {
    var m = metodosPago.find(function(x) { return x.metodo_pago_id === id; });
    if (!m) return;
    document.getElementById('modalMetodoPagoTitulo').textContent = 'Editar Método';
    document.getElementById('mp_id').value = m.metodo_pago_id;
    document.getElementById('mp_nombre').value = m.nombre;
    document.getElementById('mp_tipo').value = m.tipo;
    document.getElementById('mp_comision_porcentaje').value = m.comision_porcentaje || 0;
    document.getElementById('mp_comision_fija').value = m.comision_fija || 0;
    document.getElementById('mp_cuenta_contable').value = m.cuenta_contable || '';
    document.getElementById('mp_orden').value = m.orden || 0;
    document.getElementById('mp_requiere_referencia').checked = m.requiere_referencia === 'Y';
    document.getElementById('mp_permite_cambio').checked = m.permite_cambio === 'Y';
    document.getElementById('mp_activo').checked = m.activo === 'Y';
    abrirModal('modalMetodoPago');
}

function guardarMetodoPago(e) {
    e.preventDefault();
    var id = document.getElementById('mp_id').value;
    var data = {
        empresa_id: API.getEmpresaID(),
        nombre: document.getElementById('mp_nombre').value,
        tipo: document.getElementById('mp_tipo').value,
        comision_porcentaje: document.getElementById('mp_comision_porcentaje').value,
        comision_fija: document.getElementById('mp_comision_fija').value,
        cuenta_contable: document.getElementById('mp_cuenta_contable').value,
        orden: document.getElementById('mp_orden').value,
        requiere_referencia: document.getElementById('mp_requiere_referencia').checked ? 'Y' : 'N',
        permite_cambio: document.getElementById('mp_permite_cambio').checked ? 'Y' : 'N',
        activo: document.getElementById('mp_activo').checked ? 'Y' : 'N'
    };
    API.request(id ? '/metodos-pago/' + id : '/metodos-pago', id ? 'PUT' : 'POST', data).then(function(r) {
        if (r.success) {
            mostrarToast('Método guardado', 'success');
            cerrarModal('modalMetodoPago');
            cargarMetodosPago();
        } else { mostrarToast(r.error || 'Error', 'error'); }
    }).catch(function() { mostrarToast('Error de conexión', 'error'); });
}

// ==================== UNIDADES DE MEDIDA ====================
function cargarUnidades() {
    API.request('/unidades_medida/' + API.getEmpresaID()).then(function(r) {
        if (r.success) {
            unidades = r.unidades || [];
            renderUnidades();
        }
    }).catch(function(e) { console.error(e); });
}

function renderUnidades() {
    var tbody = document.getElementById('tablaUnidades');
    if (unidades.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty">No hay unidades</td></tr>';
        return;
    }
    tbody.innerHTML = unidades.map(function(u) {
        return '<tr>' +
            '<td><code>' + u.unidad_id + '</code></td>' +
            '<td><strong>' + u.nombre + '</strong></td>' +
            '<td>' + u.abreviatura + '</td>' +
            '<td>' + (u.tipo || 'UNIDAD') + '</td>' +
            '<td>' + (u.es_sistema === 'Y' ? '<span class="badge badge-info">Sistema</span>' : '-') + '</td>' +
            '<td><span class="badge badge-' + (u.activo === 'Y' ? 'success">Activo' : 'danger">Inactivo') + '</span></td>' +
            '<td class="actions"><button class="btn-icon" onclick="editarUnidad(\'' + u.unidad_id + '\')" ' + (u.es_sistema === 'Y' ? 'disabled' : '') + '><i class="fas fa-edit"></i></button></td></tr>';
    }).join('');
}

function abrirModalUnidad() {
    document.getElementById('modalUnidadTitulo').textContent = 'Nueva Unidad';
    document.getElementById('formUnidad').reset();
    document.getElementById('uni_editing').value = '';
    document.getElementById('uni_unidad_id').disabled = false;
    document.getElementById('uni_activo').checked = true;
    abrirModal('modalUnidad');
}

function editarUnidad(id) {
    var u = unidades.find(function(x) { return x.unidad_id === id; });
    if (!u || u.es_sistema === 'Y') return;
    document.getElementById('modalUnidadTitulo').textContent = 'Editar Unidad';
    document.getElementById('uni_editing').value = u.unidad_id;
    document.getElementById('uni_unidad_id').value = u.unidad_id;
    document.getElementById('uni_unidad_id').disabled = true;
    document.getElementById('uni_nombre').value = u.nombre;
    document.getElementById('uni_abreviatura').value = u.abreviatura;
    document.getElementById('uni_tipo').value = u.tipo || 'UNIDAD';
    document.getElementById('uni_activo').checked = u.activo === 'Y';
    abrirModal('modalUnidad');
}

function guardarUnidad(e) {
    e.preventDefault();
    var editing = document.getElementById('uni_editing').value;
    var unidadId = document.getElementById('uni_unidad_id').value.toUpperCase();
    var data = {
        empresa_id: API.getEmpresaID(),
        unidad_id: unidadId,
        nombre: document.getElementById('uni_nombre').value,
        abreviatura: document.getElementById('uni_abreviatura').value,
        tipo: document.getElementById('uni_tipo').value,
        activo: document.getElementById('uni_activo').checked ? 'Y' : 'N'
    };
    var url = editing ? '/unidades_medida/' + editing : '/unidades-medida';
    API.request(url, editing ? 'PUT' : 'POST', data).then(function(r) {
        if (r.success) {
            mostrarToast('Unidad guardada', 'success');
            cerrarModal('modalUnidad');
            cargarUnidades();
        } else { mostrarToast(r.error || 'Error', 'error'); }
    }).catch(function() { mostrarToast('Error de conexión', 'error'); });
}

// ==================== CATEGORÍAS ====================
function cargarCategorias() {
    API.request('/categorias/' + API.getEmpresaID()).then(function(r) {
        if (r.success) {
            categorias = r.categorias || [];
            renderCategorias();
            actualizarSelectCategorias();
        }
    }).catch(function(e) { console.error(e); });
}

function renderCategorias() {
    var tbody = document.getElementById('tablaCategorias');
    if (categorias.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="empty">No hay categorías</td></tr>';
        return;
    }
    tbody.innerHTML = categorias.map(function(c) {
        var padre = c.padre_id ? categorias.find(function(x) { return x.categoria_id === c.padre_id; }) : null;
        return '<tr>' +
            '<td><code>' + (c.codigo || '-') + '</code></td>' +
            '<td><strong>' + c.nombre + '</strong></td>' +
            '<td>' + (padre ? padre.nombre : '-') + '</td>' +
            '<td><span class="color-dot" style="background:' + (c.color || '#3498db') + '"></span> ' + (c.color || '#3498db') + '</td>' +
            '<td>' + (c.mostrar_pos === 'Y' ? '✓' : '-') + '</td>' +
            '<td>' + (c.mostrar_ecommerce === 'Y' ? '✓' : '-') + '</td>' +
            '<td>' + (c.orden || 0) + '</td>' +
            '<td><span class="badge badge-' + (c.activo === 'Y' ? 'success">Activo' : 'danger">Inactivo') + '</span></td>' +
            '<td class="actions"><button class="btn-icon" onclick="editarCategoria(\'' + c.categoria_id + '\')"><i class="fas fa-edit"></i></button></td></tr>';
    }).join('');
}

function actualizarSelectCategorias() {
    var opts = '<option value="">-- Ninguna (Principal) --</option>' + categorias.filter(function(c) { return c.activo === 'Y' && !c.padre_id; }).map(function(c) {
        return '<option value="' + c.categoria_id + '">' + c.nombre + '</option>';
    }).join('');
    document.getElementById('cat_padre_id').innerHTML = opts;
}

function abrirModalCategoria() {
    document.getElementById('modalCategoriaTitulo').textContent = 'Nueva Categoría';
    document.getElementById('formCategoria').reset();
    document.getElementById('cat_id').value = '';
    document.getElementById('cat_color').value = '#3498db';
    document.getElementById('cat_color_text').value = '#3498db';
    document.getElementById('cat_mostrar_pos').checked = true;
    document.getElementById('cat_mostrar_ecommerce').checked = true;
    document.getElementById('cat_activo').checked = true;
    abrirModal('modalCategoria');
}

function editarCategoria(id) {
    var c = categorias.find(function(x) { return x.categoria_id === id; });
    if (!c) return;
    document.getElementById('modalCategoriaTitulo').textContent = 'Editar Categoría';
    document.getElementById('cat_id').value = c.categoria_id;
    document.getElementById('cat_codigo').value = c.codigo || '';
    document.getElementById('cat_nombre').value = c.nombre;
    document.getElementById('cat_padre_id').value = c.padre_id || '';
    document.getElementById('cat_orden').value = c.orden || 0;
    document.getElementById('cat_descripcion').value = c.descripcion || '';
    document.getElementById('cat_color').value = c.color || '#3498db';
    document.getElementById('cat_color_text').value = c.color || '#3498db';
    document.getElementById('cat_icono').value = c.icono || '';
    document.getElementById('cat_imagen_url').value = c.imagen_url || '';
    document.getElementById('cat_mostrar_pos').checked = c.mostrar_pos === 'Y';
    document.getElementById('cat_mostrar_ecommerce').checked = c.mostrar_ecommerce === 'Y';
    document.getElementById('cat_activo').checked = c.activo === 'Y';
    abrirModal('modalCategoria');
}

function guardarCategoria(e) {
    e.preventDefault();
    var id = document.getElementById('cat_id').value;
    var data = {
        empresa_id: API.getEmpresaID(),
        codigo: document.getElementById('cat_codigo').value,
        nombre: document.getElementById('cat_nombre').value,
        padre_id: document.getElementById('cat_padre_id').value || null,
        orden: document.getElementById('cat_orden').value,
        descripcion: document.getElementById('cat_descripcion').value,
        color: document.getElementById('cat_color').value,
        icono: document.getElementById('cat_icono').value,
        imagen_url: document.getElementById('cat_imagen_url').value,
        mostrar_pos: document.getElementById('cat_mostrar_pos').checked ? 'Y' : 'N',
        mostrar_ecommerce: document.getElementById('cat_mostrar_ecommerce').checked ? 'Y' : 'N',
        activo: document.getElementById('cat_activo').checked ? 'Y' : 'N'
    };
    API.request(id ? '/categorias/' + id : '/categorias', id ? 'PUT' : 'POST', data).then(function(r) {
        if (r.success) {
            mostrarToast('Categoría guardada', 'success');
            cerrarModal('modalCategoria');
            cargarCategorias();
        } else { mostrarToast(r.error || 'Error', 'error'); }
    }).catch(function() { mostrarToast('Error de conexión', 'error'); });
}

// ==================== UTILIDADES ====================
function abrirModal(id) { document.getElementById(id).classList.add('active'); }
function cerrarModal(id) { document.getElementById(id).classList.remove('active'); }

function mostrarToast(msg, tipo) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast ' + (tipo || '');
    t.classList.add('show');
    setTimeout(function() { t.classList.remove('show'); }, 3000);
}

// ESC cierra modales
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(function(m) { m.classList.remove('active'); });
    }
});

// Click fuera cierra modal
document.querySelectorAll('.modal-overlay').forEach(function(o) {
    o.addEventListener('click', function(e) { if (e.target === this) this.classList.remove('active'); });
});
