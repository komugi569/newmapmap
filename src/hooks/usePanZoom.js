import { useState } from "react";

const MIN_SCALE = 0.4;
const MAX_SCALE = 3.0;

const getDistance = (touches) => {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
};

const clampScale = (scale) => Math.min(Math.max(scale, MIN_SCALE), MAX_SCALE);

/**
 * マウスホイール／タッチによる地図のパン・ズームを扱うフック。
 * MapContainer.jsx の肥大化を避けるため、ジェスチャー処理をここに集約している。
 */
export function usePanZoom(initialScale = 0.7) {
  const [scale, setScale] = useState(initialScale);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [dragAnchor, setDragAnchor] = useState(null); // 1本指ドラッグ用
  const [pinch, setPinch] = useState(null); // { initialDistance, initialScale, focalX, focalY }

  const handleWheel = (e) => {
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = clampScale(scale + delta);
    const mapFocalX = (e.clientX - coords.x) / scale;
    const mapFocalY = (e.clientY - coords.y) / scale;

    setScale(newScale);
    setCoords({
      x: e.clientX - mapFocalX * newScale,
      y: e.clientY - mapFocalY * newScale,
    });
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setDragAnchor({
        x: e.touches[0].clientX - coords.x,
        y: e.touches[0].clientY - coords.y,
      });
    } else if (e.touches.length === 2) {
      const initialDistance = getDistance(e.touches);
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

      setPinch({
        initialDistance,
        initialScale: scale,
        focalX: (midX - coords.x) / scale,
        focalY: (midY - coords.y) / scale,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && dragAnchor && !pinch) {
      setCoords({
        x: e.touches[0].clientX - dragAnchor.x,
        y: e.touches[0].clientY - dragAnchor.y,
      });
    } else if (e.touches.length === 2 && pinch) {
      const currentDistance = getDistance(e.touches);
      const ratio = currentDistance / pinch.initialDistance;
      const newScale = clampScale(pinch.initialScale * ratio);
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

      setScale(newScale);
      setCoords({
        x: midX - pinch.focalX * newScale,
        y: midY - pinch.focalY * newScale,
      });
    }
  };

  const handleTouchEnd = () => {
    setDragAnchor(null);
    setPinch(null);
  };

  const handleMouseDown = (e) => {
    setDragAnchor({ x: e.clientX - coords.x, y: e.clientY - coords.y });
  };

  const handleMouseMove = (e) => {
    if (dragAnchor && !pinch) {
      setCoords({ x: e.clientX - dragAnchor.x, y: e.clientY - dragAnchor.y });
    }
  };

  const handleMouseUp = () => setDragAnchor(null);

  return {
    scale,
    coords,
    isDragging: Boolean(dragAnchor),
    handlers: {
      onWheel: handleWheel,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
    },
  };
}
