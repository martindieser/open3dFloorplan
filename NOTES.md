
- diferencia entre poder dibujar paredes libremente, y hacerlo usando un spawn de rooms directamente,

-> supongo que la herramienta para dibujar paredes es para dibujar paredes internas



- sacar capacidad para dibujar columnas?

- que son las lineas random que podes poner con la escala?, se pueden sacar?


BUGS
====================================================================

- los colores no funcionan en algunos elementos

- change walls into a default thickness of 8


- multiple toggle dentro del panel menu (solo en desktop al parecer),
- no esta más pero si hay bug al tocar una estructura y draw walls, o asi, y las doors no tienen previsualizacion


- si se toca una casa rapido en touch mode se queda re bug y te deja mover todo lo que es molesto // a veces te mueve de forma random a lugares random items? - no pasa tanto como antes

- bug al colocar objeto cerca de las paredes, aparece dos posibles y te termina colocando dos objetos - FIXED aparentenemente

AGREGADOS
================================================

- cambiar draw para que no tenga anotaciones innecesarias y que no se preserve el estado entre varios usos de la herramienta.

- previsualiacion de puertas y ventanas al ponerlas en mobile

- flatten en el topbar del mobile layout

- touch screen que funcione en mobile (ham mode y select mode), si es un item te permite moverlo, sino es para moverte en el plano 

- drag & drop objetos en mobile, cerrar el panel una vez se selecciona algo

- eliminar diferenciacion entre modo select y modo pan. Ahora es modo pan por defecto, y seleccionar un objeto pasa a modo select 


================================================
FIXED

- si se esta en pan mode no s pueden poner objetos??

- drag & drop de room templates no funr

- sacar menu o dropdown del boton derecho que es horrible

- sacar toggle de furtinure en el plano (porque en el modo 3D no servia)

- piso trasparente siempre, no hay más colores de pisos

- sacar exportar y autosaved y snap grid sacado y por defecto siempre en true

- limitar el plano a una única planta.
- remove room tags in 3d view
- settings -> AI, settings -> appearance, 

- remove import image for flo
- sacar add dimensiones, measure, imports (no del todo tho)

- sacar area summary, version history

- move into its own components or just remove it:
	- help btn, lighting control, undo panel, layers?, move that into a component

	- 3d Toolbar Row


- remove dialog of duplicate & delete when clicking an object or wall

- zoom btn is in two places at same time, wtf, 