// ==================== CAFI INVENTARIO ====================

if (!API.isLoggedIn()) window.location.href = '../../index.html';

// Variables globales
var seccionActual = 'productos';
var productos = [];
var productosFiltrados = [];
var inventario = [];
var movimientos = [];
var ajustes = [];
var traspasos = [];
var categorias = [];
var subcategorias = [];
var marcas = [];
var unidades = [];
var impuestos = [];
var almacenes = [];
var ajusteProductos = [];
var traspasoProductos = [];

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', function() {
    cargarUsuarioUI();
    configurarNavegacion();
    configurarTabs();
    configurarColorPicker();
    cargarCatalogos();
    cargarProductos();
    
    // Fechas por defecto movimientos
    var hoy = new Date().toISOString().split('T')[0];
    var hace30 = new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0];
    document.getElementById('filtroMovFechaDesde').value = hace30;
    document.getElementById('filtroMovFechaHasta').value = hoy;
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
}

function cambiarSeccion(seccion) {
    seccionActual = seccion;
    document.querySelectorAll('.nav-item[data-section]').forEach(function(item) {
        item.classList.toggle('active', item.getAttribute('data-section') === seccion);
    });
    document.querySelectorAll('.content-section').forEach(function(s) { s.classList.remove('active'); });
    
    var mapa = {
        'productos': 'seccionProductos',
        'stock': 'seccionStock',
        'movimientos': 'seccionMovimientos',
        'ajustes': 'seccionAjustes',
        'traspasos': 'seccionTraspasos'
    };
    var el = document.getElementById(mapa[seccion]);
    if (el) el.classList.add('active');
    
    var titulos = {
        'productos': { t: 'Productos', s: 'Catálogo de productos', btn: 'Nuevo Producto' },
        'stock': { t: 'Stock', s: 'Existencias por almacén', btn: null },
        'movimientos': { t: 'Movimientos', s: 'Historial de movimientos', btn: null },
        'ajustes': { t: 'Ajustes', s: 'Ajustes de inventario', btn: 'Nuevo Ajuste' },
        'traspasos': { t: 'Traspasos', s: 'Traspasos entre almacenes', btn: 'Nuevo Traspaso' }
    };
    var info = titulos[seccion];
    if (info) {
        document.getElementById('pageTitle').innerHTML = '<i class="fas fa-' + getIcono(seccion) + '"></i> ' + info.t;
        document.getElementById('pageSubtitle').textContent = info.s;
        document.getElementById('btnNuevo').style.display = info.btn ? '' : 'none';
        document.getElementById('btnNuevoText').textContent = info.btn || '';
    }
    
    cargarDatosSeccion(seccion);
}

function getIcono(s) {
    return { productos:'box', stock:'cubes', movimientos:'exchange-alt', ajustes:'sliders-h', traspasos:'truck-loading' }[s] || 'box';
}

function cargarDatosSeccion(s) {
    switch(s) {
        case 'productos': cargarProductos(); break;
        case 'stock': cargarStock(); break;
        case 'movimientos': cargarMovimientos(); break;
        case 'ajustes': cargarAjustes(); break;
        case 'traspasos': cargarTraspasos(); break;
    }
}

function abrirModalNuevo() {
    switch(seccionActual) {
        case 'productos': abrirModalProducto(); break;
        case 'ajustes': abrirModalAjuste(); break;
        case 'traspasos': abrirModalTraspaso(); break;
    }
}

// ==================== CATÁLOGOS ====================
function cargarCatalogos() {
    var eid = API.getEmpresaID();
    
    API.request('/categorias/' + eid).then(function(r) {
        if (r.success) {
            categorias = r.categorias || [];
            llenarSelect('filtroCategoria', categorias, 'categoria_id', 'nombre', true);
            llenarSelect('prod_categoria_id', categorias, 'categoria_id', 'nombre', true);
            // Subcategorías también vienen aquí (padre_id != null)
            subcategorias = categorias.filter(function(c) { return c.padre_id; });
            llenarSelect('prod_subcategoria_id', subcategorias, 'categoria_id', 'nombre', true);
        }
    });
    
    API.request('/marcas/' + eid).then(function(r) {
        if (r.success) {
            marcas = r.marcas || [];
            llenarSelect('prod_marca_id', marcas, 'marca_id', 'nombre', true);
        }
    }).catch(function() { /* No hay marcas */ });
    
    API.request('/unidades/' + eid).then(function(r) {
        if (r.success) {
            unidades = r.unidades || [];
            llenarSelect('prod_unidad_inventario_id', unidades, 'unidad_id', 'nombre', true);
            llenarSelect('prod_unidad_compra_id', unidades, 'unidad_id', 'nombre', true);
            llenarSelect('prod_unidad_venta_id', unidades, 'unidad_id', 'nombre', true);
        }
    });
    
    API.request('/impuestos/' + eid).then(function(r) {
        if (r.success) {
            impuestos = r.impuestos || [];
            llenarSelect('prod_impuesto_id', impuestos, 'impuesto_id', 'nombre', true);
        }
    });
    
    API.request('/almacenes/' + eid).then(function(r) {
        if (r.success) {
            almacenes = r.almacenes || [];
            llenarSelect('filtroAlmacen', almacenes, 'almacen_id', 'nombre', true);
            llenarSelect('filtroMovAlmacen', almacenes, 'almacen_id', 'nombre', true);
            llenarSelect('filtroAjusteAlmacen', almacenes, 'almacen_id', 'nombre', true);
            llenarSelect('ajuste_almacen_id', almacenes, 'almacen_id', 'nombre', false);
            llenarSelect('traspaso_almacen_origen_id', almacenes, 'almacen_id', 'nombre', false);
            llenarSelect('traspaso_almacen_destino_id', almacenes, 'almacen_id', 'nombre', false);
        }
    });
}

function llenarSelect(id, arr, valKey, txtKey, addEmpty) {
    var sel = document.getElementById(id);
    if (!sel) return;
    var html = addEmpty ? '<option value="">- Seleccionar -</option>' : '';
    arr.forEach(function(item) {
        html += '<option value="' + item[valKey] + '">' + item[txtKey] + '</option>';
    });
    sel.innerHTML = html;
}

// ==================== PRODUCTOS ====================
function cargarProductos() {
    API.request('/productos/' + API.getEmpresaID()).then(function(r) {
        if (r.success) {
            productos = r.productos || [];
            filtrarProductos();
        }
    }).catch(function(e) { console.error(e); });
}

function filtrarProductos() {
    var buscar = document.getElementById('buscarProducto').value.toLowerCase();
    var cat = document.getElementById('filtroCategoria').value;
    var tipo = document.getElementById('filtroTipo').value;
    var estado = document.getElementById('filtroEstado').value;
    
    productosFiltrados = productos.filter(function(p) {
        if (buscar && !(p.nombre||'').toLowerCase().includes(buscar) && 
            !(p.codigo_interno||'').toLowerCase().includes(buscar) &&
            !(p.codigo_barras||'').toLowerCase().includes(buscar) &&
            !(p.producto_id||'').toLowerCase().includes(buscar)) return false;
        if (cat && p.categoria_id !== cat) return false;
        if (tipo && p.tipo !== tipo) return false;
        if (estado && p.activo !== estado) return false;
        return true;
    });
    
    renderProductos();
}

function renderProductos() {
    var tbody = document.getElementById('tablaProductos');
    if (productosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty">No hay productos</td></tr>';
        return;
    }
    tbody.innerHTML = productosFiltrados.map(function(p) {
        var stock = p.stock_total || 0;
        var stockClass = stock <= 0 ? 'stock-out' : (stock <= (p.stock_minimo || 0) ? 'stock-low' : 'stock-ok');
        return '<tr>' +
            '<td><code>' + (p.codigo_interno || p.producto_id) + '</code></td>' +
            '<td><strong>' + p.nombre + '</strong>' + (p.nombre_corto ? '<br><small>' + p.nombre_corto + '</small>' : '') + '</td>' +
            '<td>' + (p.categoria_nombre || '-') + '</td>' +
            '<td><span class="badge badge-secondary">' + (p.tipo || 'PRODUCTO') + '</span></td>' +
            '<td>$' + parseFloat(p.precio1 || 0).toFixed(2) + '</td>' +
            '<td class="' + stockClass + '">' + parseFloat(stock).toFixed(2) + '</td>' +
            '<td><span class="badge badge-' + (p.activo === 'Y' ? 'success">Activo' : 'danger">Inactivo') + '</span></td>' +
            '<td class="actions">' +
                '<button class="btn-icon" onclick="editarProducto(\'' + p.producto_id + '\')" title="Editar"><i class="fas fa-edit"></i></button>' +
                '<button class="btn-icon" onclick="verProducto(\'' + p.producto_id + '\')" title="Ver"><i class="fas fa-eye"></i></button>' +
            '</td></tr>';
    }).join('');
}

function configurarTabs() {
    document.querySelectorAll('.tabs .tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            var tabId = this.getAttribute('data-tab');
            this.parentElement.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
            this.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
            document.getElementById(tabId).classList.add('active');
        });
    });
}

function configurarColorPicker() {
    var picker = document.getElementById('prod_color_pos_picker');
    var text = document.getElementById('prod_color_pos');
    if (picker && text) {
        picker.addEventListener('input', function() { text.value = this.value; });
        text.addEventListener('input', function() { if (/^#[0-9A-Fa-f]{6}$/.test(this.value)) picker.value = this.value; });
    }
}

function abrirModalProducto() {
    document.getElementById('modalProductoTitulo').textContent = 'Nuevo Producto';
    document.getElementById('formProducto').reset();
    document.getElementById('prod_editing').value = '';
    document.getElementById('prod_producto_id').disabled = false;
    document.getElementById('prod_producto_id').value = generarID('PROD');
    
    // Defaults
    document.getElementById('prod_es_inventariable').checked = true;
    document.getElementById('prod_es_vendible').checked = true;
    document.getElementById('prod_es_comprable').checked = true;
    document.getElementById('prod_precio_incluye_impuesto').checked = true;
    document.getElementById('prod_permite_descuento').checked = true;
    document.getElementById('prod_mostrar_pos').checked = true;
    document.getElementById('prod_activo').checked = true;
    
    // Reset tabs
    document.querySelectorAll('.tabs .tab').forEach(function(t, i) { t.classList.toggle('active', i === 0); });
    document.querySelectorAll('.tab-content').forEach(function(c, i) { c.classList.toggle('active', i === 0); });
    
    abrirModal('modalProducto');
}

function editarProducto(id) {
    var p = productos.find(function(x) { return x.producto_id === id; });
    if (!p) return;
    
    document.getElementById('modalProductoTitulo').textContent = 'Editar Producto';
    document.getElementById('prod_editing').value = p.producto_id;
    document.getElementById('prod_producto_id').value = p.producto_id;
    document.getElementById('prod_producto_id').disabled = true;
    
    // Códigos
    document.getElementById('prod_codigo_interno').value = p.codigo_interno || '';
    document.getElementById('prod_codigo_barras').value = p.codigo_barras || '';
    document.getElementById('prod_sku').value = p.sku || '';
    document.getElementById('prod_codigo_sat').value = p.codigo_sat || '';
    document.getElementById('prod_codigo_proveedor').value = p.codigo_proveedor || '';
    
    // Nombres
    document.getElementById('prod_nombre').value = p.nombre || '';
    document.getElementById('prod_nombre_corto').value = p.nombre_corto || '';
    document.getElementById('prod_nombre_pos').value = p.nombre_pos || '';
    document.getElementById('prod_nombre_ticket').value = p.nombre_ticket || '';
    document.getElementById('prod_nombre_ecommerce').value = p.nombre_ecommerce || '';
    document.getElementById('prod_descripcion').value = p.descripcion || '';
    document.getElementById('prod_descripcion_corta').value = p.descripcion_corta || '';
    
    // Clasificación
    document.getElementById('prod_categoria_id').value = p.categoria_id || '';
    document.getElementById('prod_subcategoria_id').value = p.subcategoria_id || '';
    document.getElementById('prod_marca_id').value = p.marca_id || '';
    document.getElementById('prod_tipo').value = p.tipo || 'PRODUCTO';
    document.getElementById('prod_es_inventariable').checked = p.es_inventariable === 'Y';
    document.getElementById('prod_es_vendible').checked = p.es_vendible === 'Y';
    document.getElementById('prod_es_comprable').checked = p.es_comprable === 'Y';
    
    // Dimensiones
    document.getElementById('prod_peso').value = p.peso || '';
    document.getElementById('prod_peso_unidad').value = p.peso_unidad || '';
    document.getElementById('prod_largo').value = p.largo || '';
    document.getElementById('prod_ancho').value = p.ancho || '';
    document.getElementById('prod_alto').value = p.alto || '';
    document.getElementById('prod_dimension_unidad').value = p.dimension_unidad || '';
    
    // Unidades
    document.getElementById('prod_unidad_inventario_id').value = p.unidad_inventario_id || 'PZ';
    document.getElementById('prod_unidad_compra_id').value = p.unidad_compra_id || 'PZ';
    document.getElementById('prod_unidad_venta_id').value = p.unidad_venta_id || 'PZ';
    document.getElementById('prod_factor_compra').value = p.factor_compra || 1;
    document.getElementById('prod_factor_venta').value = p.factor_venta || 1;
    
    // Precios
    document.getElementById('prod_costo').value = p.costo || 0;
    document.getElementById('prod_costo_promedio').value = p.costo_promedio || 0;
    document.getElementById('prod_ultimo_costo').value = p.ultimo_costo || 0;
    document.getElementById('prod_precio1').value = p.precio1 || 0;
    document.getElementById('prod_precio2').value = p.precio2 || 0;
    document.getElementById('prod_precio3').value = p.precio3 || 0;
    document.getElementById('prod_precio4').value = p.precio4 || 0;
    document.getElementById('prod_precio_minimo').value = p.precio_minimo || 0;
    document.getElementById('prod_impuesto_id').value = p.impuesto_id || '';
    document.getElementById('prod_precio_incluye_impuesto').checked = p.precio_incluye_impuesto === 'Y';
    document.getElementById('prod_permite_descuento').checked = p.permite_descuento === 'Y';
    document.getElementById('prod_descuento_maximo').value = p.descuento_maximo || 100;
    document.getElementById('prod_comision_venta').value = p.comision_venta || 0;
    
    // Inventario
    document.getElementById('prod_stock_minimo').value = p.stock_minimo || 0;
    document.getElementById('prod_stock_maximo').value = p.stock_maximo || 0;
    document.getElementById('prod_punto_reorden').value = p.punto_reorden || 0;
    document.getElementById('prod_ubicacion_almacen').value = p.ubicacion_almacen || '';
    document.getElementById('prod_maneja_caducidad').checked = p.maneja_caducidad === 'Y';
    document.getElementById('prod_dias_caducidad').value = p.dias_caducidad || 0;
    document.getElementById('prod_maneja_series').checked = p.maneja_series === 'Y';
    
    // Config
    document.getElementById('prod_mostrar_pos').checked = p.mostrar_pos === 'Y';
    document.getElementById('prod_color_pos').value = p.color_pos || '';
    document.getElementById('prod_color_pos_picker').value = p.color_pos || '#4f46e5';
    document.getElementById('prod_orden_pos').value = p.orden_pos || 0;
    document.getElementById('prod_tecla_rapida').value = p.tecla_rapida || '';
    document.getElementById('prod_mostrar_ecommerce').checked = p.mostrar_ecommerce === 'Y';
    document.getElementById('prod_url_amigable').value = p.url_amigable || '';
    document.getElementById('prod_meta_titulo').value = p.meta_titulo || '';
    document.getElementById('prod_meta_descripcion').value = p.meta_descripcion || '';
    document.getElementById('prod_imagen_url').value = p.imagen_url || '';
    document.getElementById('prod_notas_internas').value = p.notas_internas || '';
    document.getElementById('prod_notas_compra').value = p.notas_compra || '';
    document.getElementById('prod_notas_venta').value = p.notas_venta || '';
    document.getElementById('prod_activo').checked = p.activo === 'Y';
    
    // Reset tabs
    document.querySelectorAll('.tabs .tab').forEach(function(t, i) { t.classList.toggle('active', i === 0); });
    document.querySelectorAll('.tab-content').forEach(function(c, i) { c.classList.toggle('active', i === 0); });
    
    abrirModal('modalProducto');
}

function guardarProducto(e) {
    e.preventDefault();
    var editing = document.getElementById('prod_editing').value;
    
    var data = {
        empresa_id: API.getEmpresaID(),
        producto_id: document.getElementById('prod_producto_id').value,
        codigo_interno: document.getElementById('prod_codigo_interno').value || null,
        codigo_barras: document.getElementById('prod_codigo_barras').value || null,
        sku: document.getElementById('prod_sku').value || null,
        codigo_sat: document.getElementById('prod_codigo_sat').value || null,
        codigo_proveedor: document.getElementById('prod_codigo_proveedor').value || null,
        nombre: document.getElementById('prod_nombre').value,
        nombre_corto: document.getElementById('prod_nombre_corto').value || null,
        nombre_pos: document.getElementById('prod_nombre_pos').value || null,
        nombre_ticket: document.getElementById('prod_nombre_ticket').value || null,
        nombre_ecommerce: document.getElementById('prod_nombre_ecommerce').value || null,
        descripcion: document.getElementById('prod_descripcion').value || null,
        descripcion_corta: document.getElementById('prod_descripcion_corta').value || null,
        categoria_id: document.getElementById('prod_categoria_id').value || null,
        subcategoria_id: document.getElementById('prod_subcategoria_id').value || null,
        marca_id: document.getElementById('prod_marca_id').value || null,
        tipo: document.getElementById('prod_tipo').value,
        es_inventariable: document.getElementById('prod_es_inventariable').checked ? 'Y' : 'N',
        es_vendible: document.getElementById('prod_es_vendible').checked ? 'Y' : 'N',
        es_comprable: document.getElementById('prod_es_comprable').checked ? 'Y' : 'N',
        unidad_inventario_id: document.getElementById('prod_unidad_inventario_id').value || 'PZ',
        unidad_compra_id: document.getElementById('prod_unidad_compra_id').value || 'PZ',
        unidad_venta_id: document.getElementById('prod_unidad_venta_id').value || 'PZ',
        factor_compra: document.getElementById('prod_factor_compra').value || 1,
        factor_venta: document.getElementById('prod_factor_venta').value || 1,
        peso: document.getElementById('prod_peso').value || null,
        peso_unidad: document.getElementById('prod_peso_unidad').value || null,
        largo: document.getElementById('prod_largo').value || null,
        ancho: document.getElementById('prod_ancho').value || null,
        alto: document.getElementById('prod_alto').value || null,
        dimension_unidad: document.getElementById('prod_dimension_unidad').value || null,
        costo: document.getElementById('prod_costo').value || 0,
        precio1: document.getElementById('prod_precio1').value || 0,
        precio2: document.getElementById('prod_precio2').value || 0,
        precio3: document.getElementById('prod_precio3').value || 0,
        precio4: document.getElementById('prod_precio4').value || 0,
        precio_minimo: document.getElementById('prod_precio_minimo').value || 0,
        impuesto_id: document.getElementById('prod_impuesto_id').value || null,
        precio_incluye_impuesto: document.getElementById('prod_precio_incluye_impuesto').checked ? 'Y' : 'N',
        permite_descuento: document.getElementById('prod_permite_descuento').checked ? 'Y' : 'N',
        descuento_maximo: document.getElementById('prod_descuento_maximo').value || 100,
        stock_minimo: document.getElementById('prod_stock_minimo').value || 0,
        stock_maximo: document.getElementById('prod_stock_maximo').value || 0,
        punto_reorden: document.getElementById('prod_punto_reorden').value || 0,
        ubicacion_almacen: document.getElementById('prod_ubicacion_almacen').value || null,
        maneja_caducidad: document.getElementById('prod_maneja_caducidad').checked ? 'Y' : 'N',
        dias_caducidad: document.getElementById('prod_dias_caducidad').value || 0,
        maneja_series: document.getElementById('prod_maneja_series').checked ? 'Y' : 'N',
        imagen_url: document.getElementById('prod_imagen_url').value || null,
        mostrar_pos: document.getElementById('prod_mostrar_pos').checked ? 'Y' : 'N',
        color_pos: document.getElementById('prod_color_pos').value || null,
        orden_pos: document.getElementById('prod_orden_pos').value || 0,
        tecla_rapida: document.getElementById('prod_tecla_rapida').value || null,
        mostrar_ecommerce: document.getElementById('prod_mostrar_ecommerce').checked ? 'Y' : 'N',
        url_amigable: document.getElementById('prod_url_amigable').value || null,
        meta_titulo: document.getElementById('prod_meta_titulo').value || null,
        meta_descripcion: document.getElementById('prod_meta_descripcion').value || null,
        comision_venta: document.getElementById('prod_comision_venta').value || 0,
        notas_internas: document.getElementById('prod_notas_internas').value || null,
        notas_compra: document.getElementById('prod_notas_compra').value || null,
        notas_venta: document.getElementById('prod_notas_venta').value || null,
        activo: document.getElementById('prod_activo').checked ? 'Y' : 'N'
    };
    
    var url = editing ? '/productos/' + editing : '/productos';
    API.request(url, editing ? 'PUT' : 'POST', data).then(function(r) {
        if (r.success) {
            mostrarToast('Producto guardado', 'success');
            cerrarModal('modalProducto');
            cargarProductos();
        } else { mostrarToast(r.error || 'Error', 'error'); }
    }).catch(function() { mostrarToast('Error de conexión', 'error'); });
}

function verProducto(id) {
    editarProducto(id);
}

// ==================== STOCK ====================
function cargarStock() {
    var almacenId = document.getElementById('filtroAlmacen').value;
    if (!almacenId) {
        document.getElementById('tablaStock').innerHTML = '<tr><td colspan="8" class="empty">Selecciona un almacén</td></tr>';
        return;
    }
    
    API.request('/inventario/' + API.getEmpresaID() + '/' + almacenId).then(function(r) {
        if (r.success) {
            inventario = r.inventario || [];
            calcularEstadisticas();
            filtrarStock();
        }
    }).catch(function(e) { console.error(e); });
}

function calcularEstadisticas() {
    var total = inventario.length;
    var ok = 0, bajo = 0, sin = 0;
    inventario.forEach(function(i) {
        var stock = parseFloat(i.stock || 0);
        var min = parseFloat(i.stock_minimo || 0);
        if (stock <= 0) sin++;
        else if (stock <= min) bajo++;
        else ok++;
    });
    document.getElementById('statTotalProductos').textContent = total;
    document.getElementById('statStockOk').textContent = ok;
    document.getElementById('statStockBajo').textContent = bajo;
    document.getElementById('statSinStock').textContent = sin;
}

function filtrarStock() {
    var buscar = document.getElementById('buscarStock').value.toLowerCase();
    var estado = document.getElementById('filtroStockEstado').value;
    
    var filtrado = inventario.filter(function(i) {
        if (buscar && !(i.producto_nombre||'').toLowerCase().includes(buscar) && 
            !(i.producto_id||'').toLowerCase().includes(buscar)) return false;
        var stock = parseFloat(i.stock || 0);
        var min = parseFloat(i.stock_minimo || 0);
        if (estado === 'ok' && (stock <= 0 || stock <= min)) return false;
        if (estado === 'bajo' && (stock <= 0 || stock > min)) return false;
        if (estado === 'sin' && stock > 0) return false;
        return true;
    });
    
    renderStock(filtrado);
}

function renderStock(lista) {
    var tbody = document.getElementById('tablaStock');
    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty">No hay datos</td></tr>';
        return;
    }
    tbody.innerHTML = lista.map(function(i) {
        var stock = parseFloat(i.stock || 0);
        var min = parseFloat(i.stock_minimo || 0);
        var max = parseFloat(i.stock_maximo || 0);
        var reservado = parseFloat(i.stock_reservado || 0);
        var disponible = parseFloat(i.stock_disponible || stock - reservado);
        var estado = stock <= 0 ? 'out' : (stock <= min ? 'low' : 'ok');
        var pct = max > 0 ? Math.min(100, (stock / max) * 100) : (stock > 0 ? 50 : 0);
        
        return '<tr>' +
            '<td><strong>' + (i.producto_nombre || i.producto_id) + '</strong></td>' +
            '<td>' + (i.almacen_nombre || '-') + '</td>' +
            '<td>' + stock.toFixed(2) + '</td>' +
            '<td>' + reservado.toFixed(2) + '</td>' +
            '<td><strong>' + disponible.toFixed(2) + '</strong></td>' +
            '<td>' + min.toFixed(0) + '</td>' +
            '<td>' + max.toFixed(0) + '</td>' +
            '<td><div class="stock-bar"><div class="stock-bar-fill ' + estado + '" style="width:' + pct + '%"></div></div></td>' +
        '</tr>';
    }).join('');
}

// ==================== MOVIMIENTOS ====================
function cargarMovimientos() {
    var almacenId = document.getElementById('filtroMovAlmacen').value;
    var desde = document.getElementById('filtroMovFechaDesde').value;
    var hasta = document.getElementById('filtroMovFechaHasta').value;
    
    var params = '?empresa_id=' + API.getEmpresaID();
    if (almacenId) params += '&almacen_id=' + almacenId;
    if (desde) params += '&fecha_desde=' + desde;
    if (hasta) params += '&fecha_hasta=' + hasta;
    
    API.request('/movimientos-inventario' + params).then(function(r) {
        if (r.success) {
            movimientos = r.movimientos || [];
            filtrarMovimientos();
        }
    }).catch(function(e) { console.error(e); });
}

function filtrarMovimientos() {
    var buscar = document.getElementById('buscarMovimiento').value.toLowerCase();
    var filtrado = movimientos.filter(function(m) {
        if (buscar && !(m.producto_nombre||'').toLowerCase().includes(buscar) && 
            !(m.producto_id||'').toLowerCase().includes(buscar)) return false;
        return true;
    });
    renderMovimientos(filtrado);
}

function renderMovimientos(lista) {
    var tbody = document.getElementById('tablaMovimientos');
    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="empty">No hay movimientos</td></tr>';
        return;
    }
    tbody.innerHTML = lista.map(function(m) {
        var cant = parseFloat(m.cantidad || 0);
        var clase = cant > 0 ? 'stock-ok' : 'stock-out';
        return '<tr>' +
            '<td>' + formatFecha(m.fecha) + '</td>' +
            '<td><strong>' + (m.producto_nombre || m.producto_id) + '</strong></td>' +
            '<td>' + (m.almacen_nombre || '-') + '</td>' +
            '<td>' + (m.concepto_nombre || m.concepto_id || '-') + '</td>' +
            '<td class="' + clase + '">' + (cant > 0 ? '+' : '') + cant.toFixed(2) + '</td>' +
            '<td>' + parseFloat(m.existencia_anterior || 0).toFixed(2) + '</td>' +
            '<td>' + parseFloat(m.existencia_nueva || 0).toFixed(2) + '</td>' +
            '<td>' + (m.referencia_tipo ? m.referencia_tipo + ':' + (m.referencia_id || '') : '-') + '</td>' +
            '<td>' + (m.usuario_nombre || m.usuario_id || '-') + '</td>' +
        '</tr>';
    }).join('');
}

// ==================== AJUSTES ====================
function cargarAjustes() {
    var almacenId = document.getElementById('filtroAjusteAlmacen').value;
    var estatus = document.getElementById('filtroAjusteEstatus').value;
    
    var params = '?empresa_id=' + API.getEmpresaID();
    if (almacenId) params += '&almacen_id=' + almacenId;
    if (estatus) params += '&estatus=' + estatus;
    
    API.request('/ajustes-inventario' + params).then(function(r) {
        if (r.success) {
            ajustes = r.ajustes || [];
            renderAjustes();
        }
    }).catch(function(e) { console.error(e); });
}

function renderAjustes() {
    var tbody = document.getElementById('tablaAjustes');
    if (ajustes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty">No hay ajustes</td></tr>';
        return;
    }
    tbody.innerHTML = ajustes.map(function(a) {
        var badgeClass = { BORRADOR:'warning', APLICADO:'success', CANCELADO:'danger' }[a.estatus] || 'secondary';
        return '<tr>' +
            '<td><code>' + a.ajuste_id.substring(0,8) + '</code></td>' +
            '<td>' + formatFecha(a.fecha) + '</td>' +
            '<td>' + (a.almacen_nombre || '-') + '</td>' +
            '<td><span class="badge badge-info">' + a.tipo + '</span></td>' +
            '<td>' + (a.motivo || '-') + '</td>' +
            '<td><span class="badge badge-' + badgeClass + '">' + a.estatus + '</span></td>' +
            '<td>' + (a.usuario_nombre || '-') + '</td>' +
            '<td class="actions">' +
                (a.estatus === 'BORRADOR' ? '<button class="btn-icon" onclick="editarAjuste(\'' + a.ajuste_id + '\')"><i class="fas fa-edit"></i></button>' : '') +
                '<button class="btn-icon" onclick="verDetalleAjuste(\'' + a.ajuste_id + '\')"><i class="fas fa-eye"></i></button>' +
            '</td></tr>';
    }).join('');
}

function abrirModalAjuste() {
    document.getElementById('modalAjusteTitulo').textContent = 'Nuevo Ajuste de Inventario';
    document.getElementById('formAjuste').reset();
    document.getElementById('ajuste_id').value = '';
    ajusteProductos = [];
    renderAjusteProductos();
    abrirModal('modalAjuste');
}

function editarAjuste(id) {
    var a = ajustes.find(function(x) { return x.ajuste_id === id; });
    if (!a || a.estatus !== 'BORRADOR') return;
    
    document.getElementById('modalAjusteTitulo').textContent = 'Editar Ajuste';
    document.getElementById('ajuste_id').value = a.ajuste_id;
    document.getElementById('ajuste_almacen_id').value = a.almacen_id;
    document.getElementById('ajuste_tipo').value = a.tipo;
    document.getElementById('ajuste_referencia').value = a.referencia || '';
    document.getElementById('ajuste_motivo').value = a.motivo || '';
    document.getElementById('ajuste_notas').value = a.notas || '';
    
    // Cargar detalle
    API.request('/ajustes-inventario/' + id + '/detalle').then(function(r) {
        ajusteProductos = r.detalle || [];
        renderAjusteProductos();
    });
    
    abrirModal('modalAjuste');
}

function renderAjusteProductos() {
    var tbody = document.getElementById('tablaAjusteProductos');
    if (ajusteProductos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty">Agregue productos</td></tr>';
        return;
    }
    tbody.innerHTML = ajusteProductos.map(function(p, i) {
        return '<tr>' +
            '<td>' + (p.producto_nombre || p.producto_id) + '</td>' +
            '<td><input type="number" value="' + p.cantidad + '" step="0.001" style="width:80px;" onchange="actualizarAjusteProd(' + i + ',\'cantidad\',this.value)"></td>' +
            '<td><input type="number" value="' + (p.costo_unitario || 0) + '" step="0.01" style="width:80px;" onchange="actualizarAjusteProd(' + i + ',\'costo_unitario\',this.value)"></td>' +
            '<td><button class="btn-icon btn-danger" onclick="quitarAjusteProd(' + i + ')"><i class="fas fa-trash"></i></button></td>' +
        '</tr>';
    }).join('');
}

function actualizarAjusteProd(i, campo, valor) {
    if (ajusteProductos[i]) ajusteProductos[i][campo] = parseFloat(valor) || 0;
}

function quitarAjusteProd(i) {
    ajusteProductos.splice(i, 1);
    renderAjusteProductos();
}

function buscarProductoAjuste() {
    var q = document.getElementById('buscarProdAjuste').value.toLowerCase();
    if (q.length < 2) return;
    
    var encontrado = productos.find(function(p) {
        return p.producto_id.toLowerCase() === q || 
               (p.codigo_barras||'').toLowerCase() === q ||
               (p.codigo_interno||'').toLowerCase() === q;
    });
    
    if (encontrado && !ajusteProductos.find(function(x) { return x.producto_id === encontrado.producto_id; })) {
        ajusteProductos.push({
            producto_id: encontrado.producto_id,
            producto_nombre: encontrado.nombre,
            cantidad: 1,
            costo_unitario: encontrado.costo || 0
        });
        renderAjusteProductos();
        document.getElementById('buscarProdAjuste').value = '';
    }
}

function guardarAjuste(e) {
    e.preventDefault();
    var id = document.getElementById('ajuste_id').value;
    
    var data = {
        empresa_id: API.getEmpresaID(),
        almacen_id: document.getElementById('ajuste_almacen_id').value,
        usuario_id: API.usuario.id,
        tipo: document.getElementById('ajuste_tipo').value,
        motivo: document.getElementById('ajuste_motivo').value || null,
        referencia: document.getElementById('ajuste_referencia').value || null,
        notas: document.getElementById('ajuste_notas').value || null,
        estatus: 'BORRADOR',
        detalle: ajusteProductos
    };
    
    var url = id ? '/ajustes-inventario/' + id : '/ajustes-inventario';
    API.request(url, id ? 'PUT' : 'POST', data).then(function(r) {
        if (r.success) {
            mostrarToast('Ajuste guardado', 'success');
            cerrarModal('modalAjuste');
            cargarAjustes();
        } else { mostrarToast(r.error || 'Error', 'error'); }
    }).catch(function() { mostrarToast('Error de conexión', 'error'); });
}

function aplicarAjuste() {
    var id = document.getElementById('ajuste_id').value;
    if (!id) {
        mostrarToast('Primero guarda el ajuste', 'warning');
        return;
    }
    
    if (!confirm('¿Aplicar este ajuste? Esta acción no se puede deshacer.')) return;
    
    API.request('/ajustes-inventario/' + id + '/aplicar', 'POST').then(function(r) {
        if (r.success) {
            mostrarToast('Ajuste aplicado', 'success');
            cerrarModal('modalAjuste');
            cargarAjustes();
        } else { mostrarToast(r.error || 'Error', 'error'); }
    }).catch(function() { mostrarToast('Error de conexión', 'error'); });
}

function verDetalleAjuste(id) {
    editarAjuste(id);
}

// ==================== TRASPASOS ====================
function cargarTraspasos() {
    var estatus = document.getElementById('filtroTraspasoEstatus').value;
    var params = '?empresa_id=' + API.getEmpresaID();
    if (estatus) params += '&estatus=' + estatus;
    
    API.request('/traspasos' + params).then(function(r) {
        if (r.success) {
            traspasos = r.traspasos || [];
            renderTraspasos();
        }
    }).catch(function(e) { console.error(e); });
}

function renderTraspasos() {
    var tbody = document.getElementById('tablaTraspasos');
    if (traspasos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty">No hay traspasos</td></tr>';
        return;
    }
    tbody.innerHTML = traspasos.map(function(t) {
        var badgeClass = { BORRADOR:'warning', SOLICITADO:'info', EN_TRANSITO:'primary', RECIBIDO:'success', CANCELADO:'danger' }[t.estatus] || 'secondary';
        return '<tr>' +
            '<td><code>' + t.traspaso_id.substring(0,8) + '</code></td>' +
            '<td>' + formatFecha(t.fecha_solicitud) + '</td>' +
            '<td>' + (t.almacen_origen_nombre || '-') + '</td>' +
            '<td>' + (t.almacen_destino_nombre || '-') + '</td>' +
            '<td>' + (t.referencia || '-') + '</td>' +
            '<td><span class="badge badge-' + badgeClass + '">' + t.estatus.replace('_', ' ') + '</span></td>' +
            '<td>' + (t.usuario_nombre || '-') + '</td>' +
            '<td class="actions">' +
                (t.estatus === 'BORRADOR' ? '<button class="btn-icon" onclick="editarTraspaso(\'' + t.traspaso_id + '\')"><i class="fas fa-edit"></i></button>' : '') +
                '<button class="btn-icon" onclick="verDetalleTraspaso(\'' + t.traspaso_id + '\')"><i class="fas fa-eye"></i></button>' +
            '</td></tr>';
    }).join('');
}

function abrirModalTraspaso() {
    document.getElementById('modalTraspasoTitulo').textContent = 'Nuevo Traspaso';
    document.getElementById('formTraspaso').reset();
    document.getElementById('traspaso_id').value = '';
    traspasoProductos = [];
    renderTraspasoProductos();
    abrirModal('modalTraspaso');
}

function editarTraspaso(id) {
    var t = traspasos.find(function(x) { return x.traspaso_id === id; });
    if (!t || t.estatus !== 'BORRADOR') return;
    
    document.getElementById('modalTraspasoTitulo').textContent = 'Editar Traspaso';
    document.getElementById('traspaso_id').value = t.traspaso_id;
    document.getElementById('traspaso_almacen_origen_id').value = t.almacen_origen_id;
    document.getElementById('traspaso_almacen_destino_id').value = t.almacen_destino_id;
    document.getElementById('traspaso_referencia').value = t.referencia || '';
    document.getElementById('traspaso_notas').value = t.notas || '';
    
    API.request('/traspasos/' + id + '/detalle').then(function(r) {
        traspasoProductos = r.detalle || [];
        renderTraspasoProductos();
    });
    
    abrirModal('modalTraspaso');
}

function renderTraspasoProductos() {
    var tbody = document.getElementById('tablaTraspasoProductos');
    if (traspasoProductos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty">Agregue productos</td></tr>';
        return;
    }
    tbody.innerHTML = traspasoProductos.map(function(p, i) {
        return '<tr>' +
            '<td>' + (p.producto_nombre || p.producto_id) + '</td>' +
            '<td>' + (p.stock_origen || 0) + '</td>' +
            '<td><input type="number" value="' + p.cantidad + '" step="0.001" style="width:80px;" onchange="actualizarTraspasoProd(' + i + ',this.value)"></td>' +
            '<td><button class="btn-icon btn-danger" onclick="quitarTraspasoProd(' + i + ')"><i class="fas fa-trash"></i></button></td>' +
        '</tr>';
    }).join('');
}

function actualizarTraspasoProd(i, valor) {
    if (traspasoProductos[i]) traspasoProductos[i].cantidad = parseFloat(valor) || 0;
}

function quitarTraspasoProd(i) {
    traspasoProductos.splice(i, 1);
    renderTraspasoProductos();
}

function buscarProductoTraspaso() {
    var q = document.getElementById('buscarProdTraspaso').value.toLowerCase();
    if (q.length < 2) return;
    
    var encontrado = productos.find(function(p) {
        return p.producto_id.toLowerCase() === q || 
               (p.codigo_barras||'').toLowerCase() === q ||
               (p.codigo_interno||'').toLowerCase() === q;
    });
    
    if (encontrado && !traspasoProductos.find(function(x) { return x.producto_id === encontrado.producto_id; })) {
        traspasoProductos.push({
            producto_id: encontrado.producto_id,
            producto_nombre: encontrado.nombre,
            cantidad: 1,
            stock_origen: 0 // Se actualizará al cargar stock
        });
        renderTraspasoProductos();
        document.getElementById('buscarProdTraspaso').value = '';
    }
}

function guardarTraspaso(e) {
    e.preventDefault();
    var id = document.getElementById('traspaso_id').value;
    
    if (document.getElementById('traspaso_almacen_origen_id').value === document.getElementById('traspaso_almacen_destino_id').value) {
        mostrarToast('Origen y destino deben ser diferentes', 'warning');
        return;
    }
    
    var data = {
        empresa_id: API.getEmpresaID(),
        almacen_origen_id: document.getElementById('traspaso_almacen_origen_id').value,
        almacen_destino_id: document.getElementById('traspaso_almacen_destino_id').value,
        usuario_id: API.usuario.id,
        referencia: document.getElementById('traspaso_referencia').value || null,
        notas: document.getElementById('traspaso_notas').value || null,
        estatus: 'BORRADOR',
        detalle: traspasoProductos
    };
    
    var url = id ? '/traspasos/' + id : '/traspasos';
    API.request(url, id ? 'PUT' : 'POST', data).then(function(r) {
        if (r.success) {
            mostrarToast('Traspaso guardado', 'success');
            cerrarModal('modalTraspaso');
            cargarTraspasos();
        } else { mostrarToast(r.error || 'Error', 'error'); }
    }).catch(function() { mostrarToast('Error de conexión', 'error'); });
}

function enviarTraspaso() {
    var id = document.getElementById('traspaso_id').value;
    if (!id) {
        mostrarToast('Primero guarda el traspaso', 'warning');
        return;
    }
    
    if (!confirm('¿Enviar este traspaso?')) return;
    
    API.request('/traspasos/' + id + '/enviar', 'POST').then(function(r) {
        if (r.success) {
            mostrarToast('Traspaso enviado', 'success');
            cerrarModal('modalTraspaso');
            cargarTraspasos();
        } else { mostrarToast(r.error || 'Error', 'error'); }
    }).catch(function() { mostrarToast('Error de conexión', 'error'); });
}

function verDetalleTraspaso(id) {
    editarTraspaso(id);
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

function generarID(prefix) {
    return (prefix || 'ID') + '-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
}

function formatFecha(f) {
    if (!f) return '-';
    var d = new Date(f);
    return d.toLocaleDateString('es-MX') + ' ' + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

// ESC cerrar modales
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(function(m) { m.classList.remove('active'); });
    }
});

// Click fuera cierra modal
document.querySelectorAll('.modal-overlay').forEach(function(o) {
    o.addEventListener('click', function(e) { if (e.target === this) this.classList.remove('active'); });
});
