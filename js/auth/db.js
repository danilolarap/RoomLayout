// js/auth/db.js - Base de datos local e interfaz de autenticación

const db = new Dexie("RoomLayoutDB");

db.version(1).stores({
    users: "++id, username, email, passwordHash, createdAt"
});

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

window.AuthService = {
    register: async function(username, email, password) {
        const existingEmail = await db.users.where("email").equalsIgnoreCase(email).first();
        if (existingEmail) {
            throw new Error("El correo electrónico ya está registrado.");
        }

        const existingUser = await db.users.where("username").equalsIgnoreCase(username).first();
        if (existingUser) {
            throw new Error("El nombre de usuario ya está en uso.");
        }

        const passwordHash = await hashPassword(password);
        const userId = await db.users.add({
            username,
            email,
            passwordHash,
            createdAt: new Date().toISOString()
        });

        const user = { id: userId, username, email };
        localStorage.setItem("roomlayout_user", JSON.stringify(user));
        return user;
    },

    login: async function(emailOrUser, password) {
        const passwordHash = await hashPassword(password);
        
        const user = await db.users
            .where("email").equalsIgnoreCase(emailOrUser)
            .or("username").equalsIgnoreCase(emailOrUser)
            .first();

        if (!user || user.passwordHash !== passwordHash) {
            throw new Error("Usuario o contraseña incorrectos.");
        }

        const sessionUser = { id: user.id, username: user.username, email: user.email };
        localStorage.setItem("roomlayout_user", JSON.stringify(sessionUser));
        return sessionUser;
    },

    logout: function() {
        localStorage.removeItem("roomlayout_user");
    },

    getCurrentUser: function() {
        const data = localStorage.getItem("roomlayout_user");
        return data ? JSON.parse(data) : null;
    }
};