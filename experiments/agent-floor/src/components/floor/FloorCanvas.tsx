"use client";

import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { useFloorStore } from "@/lib/store/floor-store";

interface FloorCanvasProps {
  teamId: string;
}

export default function FloorCanvas({ teamId }: FloorCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const { agents, selectedAgentId, selectAgent } = useFloorStore();

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    // Create Phaser game instance
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
      scene: {
        preload: preload,
        create: create,
        update: update,
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    gameRef.current = new Phaser.Game(config);

    // Scene functions
    function preload(this: Phaser.Scene) {
      // Create placeholder graphics for agents
      const graphics = this.make.graphics({ x: 0, y: 0 });

      // Create agent placeholder sprite (32x32)
      graphics.fillStyle(0x4ade80);
      graphics.fillCircle(16, 16, 12);
      graphics.generateTexture("agent-idle", 32, 32);
      graphics.clear();

      graphics.fillStyle(0xfbbf24);
      graphics.fillCircle(16, 16, 12);
      graphics.generateTexture("agent-working", 32, 32);
      graphics.clear();

      graphics.fillStyle(0x60a5fa);
      graphics.fillCircle(16, 16, 12);
      graphics.generateTexture("agent-thinking", 32, 32);
      graphics.clear();

      graphics.fillStyle(0xc084fc);
      graphics.fillCircle(16, 16, 12);
      graphics.generateTexture("agent-talking", 32, 32);
      graphics.clear();

      // Create desk sprite
      graphics.fillStyle(0x3d3d5c);
      graphics.fillRect(0, 0, 48, 32);
      graphics.lineStyle(2, 0x5c5c8a);
      graphics.strokeRect(0, 0, 48, 32);
      graphics.generateTexture("desk", 48, 32);
      graphics.clear();

      // Create floor tile
      graphics.fillStyle(0x16213e);
      graphics.fillRect(0, 0, 32, 32);
      graphics.lineStyle(1, 0x0f3460, 0.3);
      graphics.strokeRect(0, 0, 32, 32);
      graphics.generateTexture("floor-tile", 32, 32);

      graphics.destroy();
    }

    function create(this: Phaser.Scene) {
      const scene = this;

      // Draw floor grid
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;

      for (let x = 0; x < width; x += 32) {
        for (let y = 0; y < height; y += 32) {
          this.add.image(x + 16, y + 16, "floor-tile");
        }
      }

      // Add title
      this.add.text(16, 16, teamId.replace("-", " ").toUpperCase(), {
        fontFamily: '"Press Start 2P"',
        fontSize: "12px",
        color: "#8b8b8b",
      });

      // Store for agent sprites
      (this as unknown as { agentSprites: Map<string, Phaser.GameObjects.Container> }).agentSprites = new Map();

      // Create agent sprites
      createAgentSprites(scene);

      // Enable clicking on agents
      this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        const sprites = (scene as unknown as { agentSprites: Map<string, Phaser.GameObjects.Container> }).agentSprites;
        let clickedAgent: string | null = null;

        sprites.forEach((container, agentId) => {
          const bounds = container.getBounds();
          if (bounds.contains(pointer.x, pointer.y)) {
            clickedAgent = agentId;
          }
        });

        selectAgent(clickedAgent);
      });
    }

    function createAgentSprites(scene: Phaser.Scene) {
      const sprites = (scene as unknown as { agentSprites: Map<string, Phaser.GameObjects.Container> }).agentSprites;

      // Clear existing sprites
      sprites.forEach((container) => container.destroy());
      sprites.clear();

      // Create new sprites for each agent
      agents.forEach((agent, index) => {
        const x = 100 + index * 120;
        const y = 200;

        // Create desk
        const desk = scene.add.image(x, y + 30, "desk");

        // Create agent sprite
        const statusTexture = `agent-${agent.status}`;
        const sprite = scene.add.image(0, -20, statusTexture);

        // Create name label
        const nameLabel = scene.add.text(0, 20, agent.name, {
          fontFamily: '"Press Start 2P"',
          fontSize: "8px",
          color: "#eaeaea",
        }).setOrigin(0.5);

        // Create status indicator
        const statusDot = scene.add.circle(12, -30, 4, getStatusColor(agent.status));

        // Create container
        const container = scene.add.container(x, y, [sprite, nameLabel, statusDot]);
        container.setSize(32, 48);
        container.setInteractive();

        // Selection highlight
        if (selectedAgentId === agent.id) {
          const highlight = scene.add.graphics();
          highlight.lineStyle(2, 0xe94560);
          highlight.strokeCircle(0, -20, 18);
          container.add(highlight);
        }

        sprites.set(agent.id, container);

        // Add talking line if agent is talking to someone
        if (agent.talkingTo) {
          const targetAgent = agents.find((a) => a.id === agent.talkingTo);
          if (targetAgent) {
            const targetIndex = agents.indexOf(targetAgent);
            const targetX = 100 + targetIndex * 120;
            const line = scene.add.graphics();
            line.lineStyle(2, 0xc084fc, 0.5);
            line.lineBetween(x, y - 20, targetX, 200 - 20);
          }
        }
      });
    }

    function update(this: Phaser.Scene) {
      // Update agent positions and states
      createAgentSprites(this);
    }

    function getStatusColor(status: string): number {
      switch (status) {
        case "idle":
          return 0x4ade80;
        case "working":
          return 0xfbbf24;
        case "thinking":
          return 0x60a5fa;
        case "talking":
          return 0xc084fc;
        default:
          return 0x8b8b8b;
      }
    }

    // Handle resize
    const handleResize = () => {
      if (gameRef.current && containerRef.current) {
        gameRef.current.scale.resize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [teamId, agents, selectedAgentId, selectAgent]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full game-container"
      style={{ minHeight: "400px" }}
    />
  );
}
