"use client";

import * as React from "react";

export type TechnicianModalPosition = {
  top: number;
  bottom: number;
  left: number;
  width: number;
};

const MODAL_MAX_WIDTH = 1120;

const DESKTOP_HORIZONTAL_MARGIN = 24;
const DESKTOP_VERTICAL_MARGIN = 24;

const MOBILE_HORIZONTAL_MARGIN = 12;
const MOBILE_VERTICAL_MARGIN = 12;

const MOBILE_BREAKPOINT = 768;
const DEFAULT_TOP_BAR_HEIGHT = 64;

function isVisibleElement(
  element: HTMLElement,
) {
  const styles =
    window.getComputedStyle(
      element,
    );

  const rect =
    element.getBoundingClientRect();

  return (
    styles.display !== "none" &&
    styles.visibility !== "hidden" &&
    Number(styles.opacity) !== 0 &&
    rect.width > 0 &&
    rect.height > 0
  );
}

function isPossibleSidebar(
  element: HTMLElement,
) {
  if (!isVisibleElement(element)) {
    return false;
  }

  const rect =
    element.getBoundingClientRect();

  return (
    rect.left <= 2 &&
    rect.top <= 2 &&
    rect.width >= 56 &&
    rect.width <= 360 &&
    rect.height >=
      window.innerHeight * 0.7
  );
}

function isPossibleTopBar(
  element: HTMLElement,
) {
  if (!isVisibleElement(element)) {
    return false;
  }

  const rect =
    element.getBoundingClientRect();

  const startsAtTop =
    rect.top >= -2 &&
    rect.top <= 2;

  const hasExpectedHeight =
    rect.height >= 48 &&
    rect.height <= 100;

  const isWide =
    rect.width >=
    window.innerWidth * 0.45;

  return (
    startsAtTop &&
    hasExpectedHeight &&
    isWide
  );
}

function getSidebarRightEdge() {
  if (
    window.innerWidth <
    MOBILE_BREAKPOINT
  ) {
    return 0;
  }

  const selectors = [
    "[data-app-sidebar]",
    '[data-sidebar="sidebar"]',
    '[data-sidebar="root"]',
    "aside",
  ];

  for (
    const selector of selectors
  ) {
    const elements =
      Array.from(
        document.querySelectorAll<HTMLElement>(
          selector,
        ),
      );

    const sidebar =
      elements.find(
        isPossibleSidebar,
      );

    if (sidebar) {
      return Math.max(
        0,
        sidebar.getBoundingClientRect()
          .right,
      );
    }
  }

  const elementsAtLeft =
    document.elementsFromPoint(
      10,
      Math.round(
        window.innerHeight / 2,
      ),
    );

  const candidates =
    elementsAtLeft
      .filter(
        (
          element,
        ): element is HTMLElement =>
          element instanceof
          HTMLElement,
      )
      .filter(
        isPossibleSidebar,
      )
      .map((element) =>
        element.getBoundingClientRect(),
      )
      .sort(
        (first, second) =>
          second.width -
          first.width,
      );

  if (candidates.length > 0) {
    return Math.max(
      0,
      candidates[0].right,
    );
  }

  return 0;
}

function getTopBarBottomEdge() {
  const selectors = [
    "[data-app-header]",
    "[data-topbar]",
    "[data-header]",
    "header",
  ];

  for (
    const selector of selectors
  ) {
    const elements =
      Array.from(
        document.querySelectorAll<HTMLElement>(
          selector,
        ),
      );

    const candidates =
      elements
        .filter(
          isPossibleTopBar,
        )
        .map((element) =>
          element.getBoundingClientRect(),
        )
        .sort(
          (first, second) =>
            second.width -
            first.width,
        );

    if (
      candidates.length > 0
    ) {
      return Math.max(
        0,
        candidates[0].bottom,
      );
    }
  }

  const elementsAtTop =
    document.elementsFromPoint(
      Math.round(
        window.innerWidth / 2,
      ),
      20,
    );

  const candidates =
    elementsAtTop
      .filter(
        (
          element,
        ): element is HTMLElement =>
          element instanceof
          HTMLElement,
      )
      .filter(
        isPossibleTopBar,
      )
      .map((element) =>
        element.getBoundingClientRect(),
      )
      .sort(
        (first, second) =>
          second.width -
          first.width,
      );

  if (candidates.length > 0) {
    return Math.max(
      0,
      candidates[0].bottom,
    );
  }

  return DEFAULT_TOP_BAR_HEIGHT;
}

function calculateModalPosition(): TechnicianModalPosition {
  const viewportWidth =
    window.innerWidth;

  const viewportHeight =
    window.innerHeight;

  const isMobile =
    viewportWidth <
    MOBILE_BREAKPOINT;

  const horizontalMargin =
    isMobile
      ? MOBILE_HORIZONTAL_MARGIN
      : DESKTOP_HORIZONTAL_MARGIN;

  const verticalMargin =
    isMobile
      ? MOBILE_VERTICAL_MARGIN
      : DESKTOP_VERTICAL_MARGIN;

  const sidebarRight =
    isMobile
      ? 0
      : getSidebarRightEdge();

  const topBarBottom =
    isMobile
      ? 0
      : getTopBarBottomEdge();

  const contentLeft =
    sidebarRight +
    horizontalMargin;

  const contentRight =
    viewportWidth -
    horizontalMargin;

  const availableWidth =
    Math.max(
      280,
      contentRight -
        contentLeft,
    );

  const width =
    Math.min(
      MODAL_MAX_WIDTH,
      availableWidth,
    );

  const remainingHorizontalSpace =
    Math.max(
      0,
      availableWidth -
        width,
    );

  const requestedTop =
    topBarBottom +
    verticalMargin;

  const bottom =
    verticalMargin;

  const minimumModalHeight =
    320;

  const availableHeight =
    viewportHeight -
    requestedTop -
    bottom;

  const top =
    availableHeight >=
    minimumModalHeight
      ? requestedTop
      : Math.max(
          verticalMargin,
          viewportHeight -
            bottom -
            minimumModalHeight,
        );

  return {
    top,
    bottom,
    left:
      contentLeft +
      remainingHorizontalSpace /
        2,
    width,
  };
}

export default function useTechnicianModalPosition(
  open: boolean,
) {
  const [
    modalPosition,
    setModalPosition,
  ] =
    React.useState<TechnicianModalPosition | null>(
      null,
    );

  const updatePosition =
    React.useCallback(() => {
      setModalPosition(
        calculateModalPosition(),
      );
    }, []);

  React.useLayoutEffect(() => {
    if (!open) {
      setModalPosition(null);
      return;
    }

    let animationFrameId = 0;

    let intervalId:
      | number
      | null = null;

    function scheduleUpdate() {
      window.cancelAnimationFrame(
        animationFrameId,
      );

      animationFrameId =
        window.requestAnimationFrame(
          updatePosition,
        );
    }

    scheduleUpdate();

    intervalId =
      window.setInterval(
        scheduleUpdate,
        50,
      );

    const stopTransitionTracking =
      window.setTimeout(() => {
        if (
          intervalId !== null
        ) {
          window.clearInterval(
            intervalId,
          );

          intervalId = null;
        }

        scheduleUpdate();
      }, 700);

    window.addEventListener(
      "resize",
      scheduleUpdate,
    );

    const mutationObserver =
      new MutationObserver(
        scheduleUpdate,
      );

    mutationObserver.observe(
      document.body,
      {
        attributes: true,
        subtree: true,
        attributeFilter: [
          "class",
          "style",
          "data-state",
          "data-collapsed",
        ],
      },
    );

    return () => {
      window.cancelAnimationFrame(
        animationFrameId,
      );

      window.clearTimeout(
        stopTransitionTracking,
      );

      if (
        intervalId !== null
      ) {
        window.clearInterval(
          intervalId,
        );
      }

      mutationObserver.disconnect();

      window.removeEventListener(
        "resize",
        scheduleUpdate,
      );
    };
  }, [
    open,
    updatePosition,
  ]);

  return modalPosition;
}