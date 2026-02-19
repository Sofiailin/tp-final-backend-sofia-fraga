# 🐾 Patitas Felices 

Trabajo Práctico Final para el curso de Backend. 
Este proyecto es una API RESTful construida con Node.js y TypeScript para administrar las operaciones de una clínica veterinaria. 
Intenta realizar la gestión segura de usuarios (dueños, veterinarios y administradores), mascotas e historiales médicos.

## 📋 Descripción General

El sistema implementa una arquitectura MVC estricta y protege sus rutas mediante autenticación con JSON Web Tokens (JWT). Dependiendo del rol del usuario logueado, el sistema restringe automáticamente el acceso a los datos:
- **Dueños:** Solo pueden ver sus propias mascotas.
- **Veterinarios:** Pueden registrar mascotas, crear historiales médicos y modificar o eliminar únicamente los registros que ellos mismos crearon.
- **Administradores:** Tienen acceso total de la informacion, asi como la posibilidad de modificar y eliminar cualquier registro .

## 💻 Tecnologías Utilizadas
- **Backend:** Node.js, Express, TypeScript.
- **Base de Datos:** MongoDB, Mongoose (ODM).
- **Seguridad:** JWT (JsonWebToken), Bcrypt (encriptación de contraseñas).
- **Validaciones:** express-validator.
- **Frontend:** HTML, CSS y JavaScript consumiendo la API mediante `fetch`.

---

## 🚀 Instrucciones de Instalación y Ejecución

1. **Clonar el repositorio:**

- En un nuevo terminal clonar el repositorio con el link :
 "https://github.com/Sofiailin/tp-final-backend-sofia-fraga.git"

- Ingresar el comando "cd tp-final-backend-sofia-fraga" para ingresar a la carpeta correspondiente
   
- Instalar las dependencias con el comando "npm install"

- Configurar las Variables de Entorno:
Crea un archivo llamado .env en la raíz del proyecto basándote en el archivo .env.example incluido en los archivos del repositorio

- Ejecutar el proyecto, teniendo en cuenta de estar en la carpeta correspondiente (cd tp-final-backend-sofia-fraga)
y ejecutar el comando "npm run dev"

Acceder a la aplicación desde el link que nos muestra el terminal http://localhost:3000/


👥 Usuarios de Prueba (Pre-creados)
Para facilitar la evaluación y prueba de roles, se incluye a continuación una lista de usuarios ya registrados en la base de datos:

Usuarios de Prueba:

Rol: Veterinario
Usuario: DraSofi
Email: sofi@vet.com
Contraseña: 1234vet

Rol: Veterinario
Usuario: Flora Dalmau
Email: flora@vet.com
Contraseña: 1234flor

Rol: Dueño
Usuario: JuanPerez
Email: juan@gmail.com
Contraseña: 1234juan

Rol: Dueño
Usuario: EzequielIglesias
Email: ezequiel@gmail.com
Contraseña: eze123password

Rol: Admin
Usuario: SuperAdmin
Email: admin@sistema.com
Contraseña: 123super

Desarrollado por Sofia Fraga para el Trabajo Final.