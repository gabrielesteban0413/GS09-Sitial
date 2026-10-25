import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useAuth } from "./AuthContext";
import { api, type AnalysisResult, type LocationLayer } from "../lib/api";

interface WorkspaceContextValue {
  latestAnalysis: AnalysisResult | null;
  setLatestAnalysis: (analysis: AnalysisResult | null) => void;
  layers: LocationLayer[];
  activeLayerId: string | null;
  setActiveLayerId: (id: string | null) => void;
  refreshLayers: () => Promise<LocationLayer[]>;
  layerError: string | null;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  return (
    <WorkspaceSession key={user?.id ?? "signed-out"} userId={user?.id ?? null}>
      {children}
    </WorkspaceSession>
  );
}

function WorkspaceSession({
  children,
  userId,
}: PropsWithChildren<{ userId: string | null }>) {
  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisResult | null>(null);
  const [layers, setLayers] = useState<LocationLayer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [layerError, setLayerError] = useState<string | null>(null);

  const refreshLayers = useCallback(async () => {
    const nextLayers = await api.layers.list();
    setLayers(nextLayers);
    setActiveLayerId((currentId) =>
      currentId && nextLayers.some((layer) => layer.id === currentId)
        ? currentId
        : nextLayers[0]?.id ?? null,
    );
    setLayerError(null);
    return nextLayers;
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!userId) {
      return () => {
        mounted = false;
      };
    }
    void api.layers.list().then((nextLayers) => {
      if (!mounted) return;
      setLayers(nextLayers);
      setActiveLayerId((currentId) =>
        currentId && nextLayers.some((layer) => layer.id === currentId)
          ? currentId
          : nextLayers[0]?.id ?? null,
      );
      setLayerError(null);
    }).catch((cause: unknown) => {
      if (mounted) setLayerError(cause instanceof Error ? cause.message : "No se pudieron cargar las capas.");
    });
    return () => {
      mounted = false;
    };
  }, [userId]);

  const value = useMemo(
    () => ({
      latestAnalysis,
      setLatestAnalysis,
      layers,
      activeLayerId,
      setActiveLayerId,
      refreshLayers,
      layerError,
    }),
    [latestAnalysis, layers, activeLayerId, refreshLayers, layerError],
  );
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("useWorkspace debe usarse dentro de WorkspaceProvider.");
  return value;
}
