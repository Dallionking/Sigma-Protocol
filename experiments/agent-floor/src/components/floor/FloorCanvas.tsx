"use client";

import { useEffect, useRef, useCallback } from "react";
import * as Phaser from "phaser";
import { useFloorStore } from "@/lib/store/floor-store";
import { OfficeScene } from "@/game/scenes/OfficeScene";

interface FloorCanvasProps {
  teamId: string;
}

export default function FloorCanvas({ teamId }: FloorCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<OfficeScene | null>(null);
  const { agents, selectedAgentId, selectAgent } = useFloorStore();

  // Callback for agent selection from scene
  const handleAgentSelect = useCallback(
    (agentId: string | null) => {
      selectAgent(agentId);
    },
    [selectAgent]
  );

  // Initialize Phaser game with OfficeScene
  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    // Create OfficeScene instance with configuration
    const officeScene = new OfficeScene({
      teamId,
      onAgentSelect: handleAgentSelect,
      onReady: () => {
        // Get current agents from store and pass to scene
        const currentAgents = useFloorStore.getState().agents;
        officeScene.setAgents(currentAgents);
      },
    });
    sceneRef.current = officeScene;

    // Phaser game configuration
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      backgroundColor: "#1a1a2e",
      pixelArt: true,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: officeScene,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    gameRef.current = new Phaser.Game(config);

    // Handle window resize
    const handleResize = () => {
      if (gameRef.current && containerRef.current && sceneRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        gameRef.current.scale.resize(width, height);
        sceneRef.current.resize(width, height);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        sceneRef.current = null;
      }
    };
  }, [teamId, handleAgentSelect]);

  // Update scene with new agents data
  useEffect(() => {
    if (sceneRef.current && sceneRef.current.scene?.isActive()) {
      sceneRef.current.setAgents(agents);
    }
  }, [agents]);

  // Update scene with selected agent
  useEffect(() => {
    if (sceneRef.current && sceneRef.current.scene?.isActive()) {
      // The selection state is managed internally by the scene
      // This sync ensures external selection changes are reflected
      if (selectedAgentId !== null) {
        sceneRef.current.setSelectedAgent(selectedAgentId);
      }
    }
  }, [selectedAgentId]);

  // Update team ID if it changes
  useEffect(() => {
    if (sceneRef.current && sceneRef.current.scene?.isActive()) {
      const currentConfig = sceneRef.current.getConfig();
      if (currentConfig.teamId !== teamId) {
        sceneRef.current.setTeamId(teamId);
      }
    }
  }, [teamId]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full game-container"
      style={{ minHeight: "400px" }}
    />
  );
}
