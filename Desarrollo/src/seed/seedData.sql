-- # indicamos que usaremos db apt6
use apt6;

-- #poblar tabla roles
insert into rol (id, rol) values (null, 'alumno'); 
insert into rol (id, rol) values (null, 'consejero'); 
insert into rol (id, rol) values (null, 'director'); 
insert into rol (id, rol) values (null, 'superadmin'); 


-- #poblar tabla de jornadas
insert into jornada (id, jornada) values (null, 'diurna'); 
insert into jornada (id, jornada) values (null, 'vespertina'); 


-- #poblar tabla de escuelas
insert into escuela (id, escuela) values (null, 'Escuela de Informática y Telecomunicaciones');
insert into escuela (id, escuela) values (null, 'Escuela de Salud');
insert into escuela (id, escuela) values (null, 'Escuela de Ingeniería y Recursos Naturales');
insert into escuela (id, escuela) values (null, 'Escuela de Construcción');
insert into escuela (id, escuela) values (null, 'Escuela de Administración y Negocios' );


-- #poblar tabla de carreras

-- #INFORMATICA
insert into carrera (id, carrera, escuela_id) values (null, 'Analista Programador Computacional', 1);
insert into carrera (id, carrera, escuela_id) values (null, 'Ingeniería en Conectividad y Redes', 1);
insert into carrera (id, carrera, escuela_id) values (null, 'Ingeniería en Informática', 1);
-- #SALUD
insert into carrera (id, carrera, escuela_id) values (null, 'Técnico en Enfermería', 2);
insert into carrera (id, carrera, escuela_id) values (null, 'Técnico en Odontología', 2);
-- #INGENIERIA Y RECURSOS NATURALES
insert into carrera (id, carrera, escuela_id) values (null, 'Ingeniería en Electricidad y Automatización Industrial', 3);
insert into carrera (id, carrera, escuela_id) values (null, 'Ingeniería en Mecánica Automotriz y Autotrónica', 3);
insert into carrera (id, carrera, escuela_id) values (null, 'Técnico en Mecánica Automotriz y Autotrónica', 3);
-- #CONSTRUCCION
insert into carrera (id, carrera, escuela_id) values (null, 'Ingeniería en Construcción', 4);
insert into carrera (id, carrera, escuela_id) values (null, 'Ingeniería en Prevención de Riesgos', 4);
insert into carrera (id, carrera, escuela_id) values (null, 'Técnico en Construcción', 4);
-- #ADMINISTRACION Y NEGOCIOS
insert into carrera (id, carrera, escuela_id) values (null, 'Auditoría', 5);
insert into carrera (id, carrera, escuela_id) values (null, 'Contabilidad General Mención Legislación Tributaria', 5);
insert into carrera (id, carrera, escuela_id) values (null, 'Ingeniería en Administración Mención Gestión de Personas', 5);
insert into carrera (id, carrera, escuela_id) values (null, 'Ingeniería en Administración Mención Finanzas', 5);
insert into carrera (id, carrera, escuela_id) values (null, 'Ingeniería en Gestión Logística', 5);
insert into carrera (id, carrera, escuela_id) values (null, 'Ingeniería en Marketing Digital', 5);
insert into carrera (id, carrera, escuela_id) values (null, 'Técnico en Administración', 5);
insert into carrera (id, carrera, escuela_id) values (null, 'Técnico en Gestión de Personas', 5);

-- #ACTUALIZA ROL SUPERADMIN
update usuario set rol_id = 4 where correo = 'cr.zavala@duocuc.cl';



