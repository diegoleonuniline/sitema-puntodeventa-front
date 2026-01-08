// ==================== CAFI LOGIN ====================

// Verificar si ya está logueado
if (API.isLoggedIn()) {
    window.location.href = 'modules/pos/index.html';
}

// Form submit
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    var email = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;
    var btn = document.getElementById('btnLogin');
    var mensaje = document.getElementById('mensaje');
    
    // Validación básica
    if (!email || !password) {
        mostrarMensaje('Completa todos los campos', 'error');
        return;
    }
    
    // UI loading
    btn.disabled = true;
    btn.classList.add('loading');
    mensaje.className = 'mensaje';
    mensaje.style.display = 'none';
    
    try {
        var result = await API.login(email, password);
        
        if (result.success) {
            mostrarMensaje('¡Bienvenido! Redirigiendo...', 'success');
            
            setTimeout(function() {
                window.location.href = 'modules/pos/index.html';
            }, 800);
        } else {
            mostrarMensaje(result.error || 'Credenciales incorrectas', 'error');
            btn.disabled = false;
            btn.classList.remove('loading');
        }
    } catch (error) {
        console.error('Login error:', error);
        mostrarMensaje('Error de conexión. Intenta de nuevo.', 'error');
        btn.disabled = false;
        btn.classList.remove('loading');
    }
});

// Mostrar mensaje
function mostrarMensaje(texto, tipo) {
    var mensaje = document.getElementById('mensaje');
    mensaje.textContent = texto;
    mensaje.className = 'mensaje ' + tipo;
    mensaje.style.display = 'block';
}

// Enter en password
document.getElementById('password').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    }
});

// Focus en email al cargar
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('email').focus();
});
