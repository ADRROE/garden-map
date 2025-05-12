// context/LayerVisibilityContext.tsx
import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { GardenLayerAction } from '@/services/actions';
import { GardenLayerState, LayerName } from '@/types';



const GardenLayerContext = createContext<
  { layerstate: GardenLayerState; layerdispatch: React.Dispatch<GardenLayerAction> } | undefined
>(undefined);

const initialState: GardenLayerState = {
    visibleLayers: ['background', 'elements'] satisfies LayerName[],
};

function reducer(layerstate: GardenLayerState, layeraction: GardenLayerAction): GardenLayerState {
  switch (layeraction.type) {
    case 'TOGGLE_LAYER':
      return {
        ...layerstate,
        visibleLayers: layerstate.visibleLayers.filter(l => l !== layeraction.layer)
      };
    case 'SHOW_LAYER':
      return {
        ...layerstate,
        visibleLayers: layerstate.visibleLayers
      };
    case 'HIDE_LAYER':
      return {
        ...layerstate,
        visibleLayers: layerstate.visibleLayers.filter(l => l !== layeraction.layer),
      };
    case 'SET_VISIBLE_LAYERS':
      return {
        ...layerstate,
        visibleLayers: [...layeraction.layers],
      };
    default:
      return layerstate;
  }
}

export const GardenLayerProvider = ({ children }: { children: ReactNode }) => {
  const [layerstate, layerdispatch] = useReducer(reducer, initialState);

  return (
    <GardenLayerContext.Provider value={{ layerstate, layerdispatch }}>
      {children}
    </GardenLayerContext.Provider>
  );
};

export const useGardenLayer = () => {
  const context = useContext(GardenLayerContext);
  if (!context) {
    throw new Error('useLayerVisibility must be used within a LayerVisibilityProvider');
  }
  return context;
};