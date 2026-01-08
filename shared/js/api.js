// ==================== CAFI API ====================
var API = {
    baseURL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api' 
        : 'https://sistemapuntodeventa-5dd0d54a05c1.herokuapp.com/api',
    
    token: localStorage.getItem('cafi_token'),
    usuario: JSON.parse(localStorage.getItem('cafi_usuario') || 'null'),
    
    request: function(endpoint, method, data) {
        var self = this;
        method = method || 'GET';
        
        var options = {
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        
        if (self.token) {
            options.headers['Authorization'] = 'Bearer ' + self.token;
        }
        
        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }
        
        return fetch(self.baseURL + endpoint, options)
            .then(function(response) {
                if (response.status === 401) {
                    self.logout();
                    throw new Error('Sesión expirada');
                }
                return response.json();
            });
    },
    
    login: function(email, password) {
        var self = this;
        return this.request('/auth/login', 'POST', {
            email: email,
            password: password
        }).then(function(r) {
            if (r.success && r.token) {
                self.token = r.token;
                self.usuario = r.usuario;
                localStorage.setItem('cafi_token', r.token);
                localStorage.setItem('cafi_usuario', JSON.stringify(r.usuario));
            }
            return r;
        });
    },
    
    logout: function() {
        this.token = null;
        this.usuario = null;
        localStorage.removeItem('cafi_token');
        localStorage.removeItem('cafi_usuario');
        window.location.href = '/index.html';
    },
    
    isLoggedIn: function() {
        return !!(this.token && this.usuario);
    },
    
    getEmpresaID: function() {
        return this.usuario ? this.usuario.empresa_id : null;
    },
    
    getSucursalID: function() {
        return this.usuario ? this.usuario.sucursal_id : null;
    },
    
    getUsuarioID: function() {
        return this.usuario ? this.usuario.usuario_id : null;
    }
};
