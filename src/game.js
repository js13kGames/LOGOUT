
import { Entity, Game, integer as random_integer, element_of as random_element_of } from './cervus/core';
import { Transform, Move, Render, Light } from './cervus/components';
import { BasicMaterial, PhongMaterial, WireframeMaterial } from './cervus/materials';
import { Box } from './cervus/shapes';

const CLEAR_COLOR = "333";
const BUILDING_COLOR = "222";
const NEON_COLORS = ["28D7FE", "A9FFDC", "FED128"];
const NEON_LIGHT_MOUNT = [0, 0, -20];
const NEON_INTENSITY = 15;

import map from './map.json';
const MAX_BUILDING_HEIGHT = 32;
const MIN_BUILDING_HEIGHT = 8;

class Group extends Entity {
  constructor(options) {
    super(Object.assign({
      components: [
          new Transform()
      ]
    }, options));
  }
}

function hex_to_rgb(hex) {
  if (hex.charAt(0) === '#') {
    hex = hex.substr(1);
  }

  if (hex.length === 3) {
    hex = hex.split('').map(
      el => el + el
    ).join('');
  }

  return hex.match(/.{1,2}/g).map(
    el => parseFloat((parseInt(el, 16) / 255).toFixed(2))
  );
}

export default
function create_game() {
    const game = new Game({
      width: window.innerWidth,
      height: window.innerHeight,
      projection: "ortho",
      far: 1000,
      clear_color: CLEAR_COLOR,
    });

    game.canvas.addEventListener(
      'click', () => game.canvas.requestPointerLock()
    );

    game.camera.get_component(Transform).set({
        position: [map.starting_point.x, 1.75, map.starting_point.y],
    });

    game.camera.get_component(Move).set({
        keyboard_controlled: true,
        mouse_controlled: true,
        move_speed: 5,
    });

    // Remove the default light.
    game.remove(game.light);

    const cube = new Box();
    const cube_render = cube.get_component(Render);

    let neon_material = new BasicMaterial({
      requires: [
        Render,
        Transform
      ]
    });

    neon_material.add_fog({
      color: hex_to_rgb(CLEAR_COLOR),
      distance: new Float32Array([10, 100]),
    });

    let building_material = new PhongMaterial({
      requires: [
        Render,
        Transform
      ]
    });

    building_material.add_fog({
      color: hex_to_rgb(CLEAR_COLOR),
      distance: new Float32Array([0, 30]),
    });

    const wireframe = new WireframeMaterial({
      requires: [
        Render,
        Transform
      ]
    });

    const plane = new Box();
    plane.get_component(Render).material = building_material;
    plane.get_component(Render).color = BUILDING_COLOR;
    plane.get_component(Transform).set({
        position: [0, -0.5, 0],
        scale: [map.size.x * 10, 1, map.size.y * 10],
    });
    game.add(plane);

    function create_building(options) {
        let {position, scale} = options;
        let group = new Entity({
            components: [
                new Transform({position})
            ]
        });

        let building = new Box();
        building.get_component(Render).set({
            material: building_material,
            color: BUILDING_COLOR,
        });
        building.get_component(Transform).set({scale});
        group.add(building);

        let {neon_position, neon_scale, neon_color} = options;
        let neon = new Box();
        neon.get_component(Render).set({
            material: neon_material,
            color: neon_color,
        });
        neon.get_component(Transform).set({
            position: neon_position,
            scale: neon_scale,
        });

        let neon_light = new Entity({
            components: [
                new Transform({
                    position: NEON_LIGHT_MOUNT
                }),
                new Light({
                    color: neon_color,
                    intensity: NEON_INTENSITY,
                }),
                // new Render({
                //     color: "fff",
                //     material: wireframe,
                //     indices: cube_render.indices,
                //     vertices: cube_render.vertices
                //})
            ]
        });
        neon.add(neon_light);
        group.add(neon);

        game.add(group);
    }

    for (let building of map.buildings) {
        let {x1, y1, x2, y2} = building;
        let xsize = Math.abs(x2 - x1);
        let zsize = Math.abs(y2 - y1);

        let center_x = x1 + (xsize/2);
        let center_z = y1 + (zsize/2);

        let height = random_integer(
          MIN_BUILDING_HEIGHT, MAX_BUILDING_HEIGHT
        );

        create_building({
            position: [center_x, height / 2, center_z],
            scale: [xsize, height, zsize],
            neon_position: [0, 1, - (zsize/2) - 0.2],
            neon_scale: [4, 2, 0.1],
            neon_color: random_element_of(NEON_COLORS),
        });
    }

    window.game = game;
    return game;
}
