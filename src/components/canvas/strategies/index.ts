import { StartStrategy } from "./StartStrategy";
import { MyGalaxyStrategy } from "./MyGalaxyStrategy";
import { UniverseStrategy } from "./UniverseStrategy";
import { SceneStrategy } from "./types";

export const strategies: Record<string, SceneStrategy> = {
    start: StartStrategy,
    my_galaxy: MyGalaxyStrategy,
    universe: UniverseStrategy,
};

export * from "./types";
