import { renderHook, act } from "@testing-library/react";
import { useImageState } from "../useImageState";

describe("useImageState hook", () => {
  test("should initialize with default values when no arguments provided", () => {
    const { result } = renderHook(() => useImageState());
    
    expect(result.current.zoomLevel).toBe(100);
    expect(result.current.imagePosition).toEqual({ x: 0, y: 0 });
    expect(result.current.isDraggingImage).toBe(false);
  });

  test("should initialize with provided values", () => {
    const initialZoom = 150;
    const initialPosition = { x: 10, y: 20 };
    
    const { result } = renderHook(() => useImageState(initialZoom, initialPosition));
    
    expect(result.current.zoomLevel).toBe(initialZoom);
    expect(result.current.imagePosition).toEqual(initialPosition);
  });

  test("should update zoom level when setZoomLevel is called", () => {
    const { result } = renderHook(() => useImageState());
    
    act(() => {
      result.current.setZoomLevel(150);
    });
    
    expect(result.current.zoomLevel).toBe(150);
  });

  test("should update image position when setImagePosition is called", () => {
    const { result } = renderHook(() => useImageState());
    const newPosition = { x: 20, y: 30 };
    
    act(() => {
      result.current.setImagePosition(newPosition);
    });
    
    expect(result.current.imagePosition).toEqual(newPosition);
  });

  test("should start dragging on mouse down", () => {
    const { result } = renderHook(() => useImageState());
    const mouseDownEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      clientX: 100,
      clientY: 100
    } as unknown as React.MouseEvent<HTMLDivElement>;
    
    act(() => {
      result.current.handleImageMouseDown(mouseDownEvent);
    });
    
    expect(result.current.isDraggingImage).toBe(true);
    expect(result.current.dragStart).toEqual({ x: 100, y: 100 });
    expect(mouseDownEvent.preventDefault).toHaveBeenCalled();
    expect(mouseDownEvent.stopPropagation).toHaveBeenCalled();
  });

  test("should update position on mouse move when dragging", () => {
    const { result } = renderHook(() => useImageState());
    
    // Set initial drag state
    act(() => {
      result.current.setIsDraggingImage(true);
      result.current.setDragStart({ x: 100, y: 100 });
    });
    
    // Simulate mouse move event
    const mouseMoveEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      clientX: 120,
      clientY: 110
    } as unknown as React.MouseEvent<HTMLDivElement>;
    
    act(() => {
      result.current.handleImageMouseMove(mouseMoveEvent);
    });
    
    // Check that position was updated by the difference (20, 10)
    expect(result.current.imagePosition).toEqual({ x: 20, y: 10 });
    expect(result.current.dragStart).toEqual({ x: 120, y: 110 });
  });

  test("should not update position on mouse move when not dragging", () => {
    const { result } = renderHook(() => useImageState());
    
    // Set initial position
    const initialPosition = { x: 10, y: 10 };
    act(() => {
      result.current.setImagePosition(initialPosition);
    });
    
    // Simulate mouse move event
    const mouseMoveEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      clientX: 120,
      clientY: 110
    } as unknown as React.MouseEvent<HTMLDivElement>;
    
    act(() => {
      result.current.handleImageMouseMove(mouseMoveEvent);
    });
    
    // Position should remain unchanged
    expect(result.current.imagePosition).toEqual(initialPosition);
    expect(mouseMoveEvent.preventDefault).not.toHaveBeenCalled();
  });

  test("should stop dragging on mouse up", () => {
    const { result } = renderHook(() => useImageState());
    
    // Set initial drag state to true
    act(() => {
      result.current.setIsDraggingImage(true);
    });
    
    // Simulate mouse up event
    const mouseUpEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn()
    } as unknown as React.MouseEvent<HTMLDivElement>;
    
    act(() => {
      result.current.handleImageMouseUp(mouseUpEvent);
    });
    
    expect(result.current.isDraggingImage).toBe(false);
    expect(mouseUpEvent.preventDefault).toHaveBeenCalled();
    expect(mouseUpEvent.stopPropagation).toHaveBeenCalled();
  });
});
