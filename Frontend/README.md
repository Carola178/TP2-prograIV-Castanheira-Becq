Red Social "Patitas al Refugio" - Programación IV - TP 2

Actores, Requerimientos Funcionales y No Funcionales, decisiones técnicas.

Actores del Sistema y Roles:

1.	Usuario No Autenticado (Visitante): Puede registrarse o iniciar sesión. 
2.	Usuario Autenticado (Usuario Estándar): Puede gestionar su perfil, realizar publicaciones, reaccionar, comentar, guardar, compartir, y explorar perfiles de otros usuarios. 
3.	Administrador: Posee todos los permisos de un usuario estándar, sumado a la capacidad de moderar contenido (dar de baja publicaciones), gestionar usuarios (altas, bajas lógicas y rehabiitaciones) y visualizar paneles de estadísticas.


Requerimientos Funcionales (RF)

RF01 - Registro de Usuario: El sistema debe permitir registrar usuarios solicitando: nombre, apellido, correo electrónico, nombre de usuario, contraseña, confirmación de contraseña, fecha de nacimiento, descripción breve y foto de perfil (file).

RF02 - Validación de Campos de Registro: El correo electrónico y el nombre de usuario deben ser únicos en la base de datos. 
La contraseña debe poseer al menos 8 caracteres, una letra mayúscula y un número.

RF03 - Iniciar Sesión (Login): Debe permitir autenticarse utilizando correo o nombre de usuario + contraseña. 

RF04 - Generación y Expiración de Token JWT: La autenticación exitosa debe devolver un token JWT con vigencia exacta de 15 minutos que contenga la identidad del usuario y su rol. 

RF05 - Renovación/Refresco de Token: El sistema debe advertir mediante un modal al minuto 10 de sesión activa sobre la próxima expiración (a los 15 minutos) y permitir extender la sesión renovando el token. 

RF06 - Control de Expiración / Redirección 401: Si una petición devuelve un estado 401 Unauthorized o el token no es válido, el frontend debe redirigir al Login. 

RF07 - Validación Inicial al Cargar la App: Al iniciar la aplicación, debe mostrar una pantalla de carga (spinner) mientras valida el token mediante una ruta autorizar para redirigir a publicaciones o al login. 

RF08 - Perfil de Usuario Propio: El usuario debe poder visualizar y editar sus datos personales, foto de perfil y sus últimas 3 publicaciones con sus comentarios. 

RF09 - Perfil de Otros Usuarios: El usuario debe poder hacer clic en el nombre o imagen de otro usuario para ver sus datos públicos y sus últimas 3 publicaciones. 

RF10 - Crear Publicación: Permitir redactar publicaciones compuestas por: título, mensaje e imagen opcional. 

RF11 - Listar y Visualizar Publicaciones: Debe permitir visualizar las publicaciones ordenadas por defecto por fecha más reciente. 
Soporte de visualización detallada por publicación con sus comentarios asociados. 

RF12 - Paginación e Infinite Scroll: Carga progresiva de publicaciones mediante Infinite Scroll (reemplazando la paginación inicial).

RF13 - Ordenamiento Dinámico de Publicaciones: Debe permitir ordenar el listado por:
•	Fecha de creación. 
•	Cantidad de "Me gusta". 
•	Cantidad de veces guardada. 
•	Cantidad de veces compartida.

RF14 - Eliminar Publicación: El autor original de una publicación o un Administrador pueden darla de baja lógica.

RF15 - Guardar y Desguardar Publicaciones: Permitir marcar/desmarcar publicaciones como guardadas e indicarlo visualmente. 

RF16 - Vista de Publicaciones Guardadas: Pantalla exclusiva para interactuar con las publicaciones guardadas por el usuario. 

RF17 - Compartir Publicaciones: Permitir compartir una publicación con otro usuario específico de la plataforma. 

RF18 - Vista de Publicaciones Compartidas: Sección para revisar publicaciones recibidas de otros usuarios y quién las compartió. 

RF19 - Dar y Quitar "Me Gusta": Permitir a un usuario autenticado dar o quitar un único "Me gusta" por publicación. 

RF20 - Comentar Publicación: Permitir agregar comentarios asociados al usuario y fecha. 

RF21 - Carga Progresiva de Comentarios: Mostrar comentarios ordenados (más recientes primero) con un botón "Cargar más". 

RF22 - Editar Comentario: El autor de un comentario puede modificarlo, mostrándose la indicación visual de que fue editado (modificado: true). 

RF23 - Moderación de Contenido: Los administradores pueden dar de baja lógica cualquier publicación y sus comentarios en cualquier pantalla. 

RF24 - Gestión de Usuarios (Dashboard):
•	Listar todos los usuarios. 
•	Crear nuevos usuarios asignando perfil "usuario" o "administrador". 
•	Realizar alta y baja lógica (deshabilitación) de usuarios. 

RF25 - Restricción a Usuarios Deshabilitados: Un usuario con baja lógica no podrá ingresar al sistema y verá una notificación al intentarlo. 

RF26 - Métrica de Publicaciones por Período: Gráfico de publicaciones por usuario en un lapso de tiempo filtrable. 

RF27 - Métrica de Comentarios por Período: Gráfico de comentarios realizados en un lapso filtrable. 

RF28 - Métrica de Comentarios por Publicación: Gráfico de cantidad de comentarios por posteo en un lapso filtrable. 

RF29 - Métrica de Logins por Usuario: Gráfico de historial/cantidad de ingresos por usuario. 

RF30 - Métrica de Visitas al Perfil: Gráfico de visitas al perfil por parte de terceros. 

RF31 - Métrica de Reacciones Diarias: Gráfico de "Me gusta" otorgados por día. 



Requerimientos No Funcionales (RNF)

RNF01 - Separación de Capas: Arquitectura desacoplada en dos proyectos independientes: Frontend en Angular y Backend en NestJS. 

RNF02 - Base de Datos: Uso de base de datos NoSQL MongoDB. 

RNF03 - Progressive Web App (PWA): El frontend debe estar implementado como PWA. 

RNF04 - Diseño Trabajado e Uniforme: Interfaz atractiva y coherente en todos los componentes. Sin HTML plano ni nativo alert() (uso estricto de modales). 

RNF05 - Favicon Personalizado: Implementación de favicon propio para la aplicación. 

RNF06 - Extensiones de Angular Personalizadas: Uso obligatorio de al menos:
•	3 Pipes personalizadas. 
•	3 Directivas personalizadas. 

RNF07 - Encriptación de Contraseñas: Las contraseñas deben estar encriptadas/hasheadas antes de guardarse en la BD. 

RNF08 - Manejo Seguro de Archivos: Las imágenes (de perfil y de publicaciones) deben guardarse físicamente en el servidor/storage y almacenar únicamente su URL en la BD. 

RNF09 - Autenticación Stateless con JWT: Uso de tokens JWT firmados para autorizar todas las peticiones a rutas protegidas. 

RNF10 - Manejo Correcto de HTTP Status Codes: Respetar los estándares HTTP (201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, etc.). Prohibido devolver 200 OK en casos de error o 400 en éxito. 

RNF11 - Despliegue (Deploy): La aplicación frontend debe estar desplegada en un entorno de hosting web accesible. 



Reglas Técnicas y Stack Tecnológico

Arquitectura General
•	Arquitectura de Software: Aplicación web desacoplada estructurada en dos proyectos independientes (Cliente-Servidor / Frontend - Backend). 
•	Patrón de Arquitectura: REST API (comunicación mediante peticiones HTTP asíncronas).


Backend (Servidor)
•	Entorno de Ejecución: Node.js.
•	Framework Backend: NestJS (arquitectura modular basada en controladores, servicios y módulos). 
•	Base de Datos: MongoDB (NoSQL). 
•	Seguridad y Autenticación:
o	Encriptación de contraseñas mediante librerías de hashing (ej. bcrypt). 
o	Autenticación basada en tokens JWT (JSON Web Tokens) con expiración estricta de 15 minutos. 
•	Manejo de Archivos: Almacenamiento local o en servidor de archivos multimedia (imágenes de perfil y publicaciones) guardando únicamente la ruta/URL en la base de datos. 
•	Gestión de Errores y Protocolo HTTP: Uso estricto de códigos de estado HTTP semánticos y correctos (201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, etc.), prohibiendo devolver código 200 en errores o 400 en respuestas exitosas. 


Frontend (Cliente Web)
•	Framework Frontend: Angular. 
•	Tipo de Aplicación: PWA (Progressive Web App) para soporte offline y capacidades nativas web. 
•	Componentes y Extensiones Propias de Angular:
o	Implementación obligatoria de al menos 3 Pipes personalizados. 
o	Implementación obligatoria de al menos 3 Directivas personalizadas. 
•	Manejo de Sesión Local: Almacenamiento seguro del token JWT en el navegador (Local Storage, Session Storage o Cookies HTTP-Only). 
•	Interfaz de Usuario (UI/UX):
o	Diseño trabajado y uniforme, prohibiendo el uso de HTML plano o básico. 
o	Uso estricto de modales para alertas, avisos o interacciones, prohibiendo el uso de la función nativa alert() de JavaScript. 
o	Favicon personalizado de la aplicación. 
•	Navegación y UX Dinámica:
o	Enrutamiento modular entre pantallas sin restricciones indebidas de acceso (salvo validaciones de roles y autenticación). 
o	Implementación de Infinite Scroll para la carga fluida de publicaciones en el feed principal (reemplazando la paginación estática). 
o	Visualización de datos estadísticos mediante gráficos interactivos en el panel de administración. 


Control de Versiones, Despliegue y Entorno
•	Control de Versiones: Git y GitHub para la gestión del código fuente en equipo.
•	Hosting y Despliegue: Despliegue de la aplicación frontend en un entorno de hosting web accesible públicamente. 
