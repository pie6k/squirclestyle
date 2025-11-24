import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Analytics } from "@vercel/analytics/react";
import { AutoNumberSpring } from "./spring/AutoNumberSpring";
import { NumberSlider } from "./NumberPicker";
import { SpringConfigInput } from "./spring/config";
import { autorun } from "mobx";
import { createCleanup } from "./utils/cleanup";
import styled from "styled-components";
import { useBox } from "./hooks";

const Shell = styled.main`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  width: 100%;
  max-width: 36rem;
`;

const CardHolder = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
`;

const CARD_HEIGHT = 30;

const Card = styled.div`
  width: min(30vh, 70vw);
  aspect-ratio: 1;
  border-radius: 2rem;
  background: #fff;
  will-change: border-radius, corner-shape;
`;

const SuggestionButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background: #fff;
  color: #000;
  border: none;
  cursor: pointer;
`;

const Options = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SPRING_CONFIG: SpringConfigInput = {
  stiffness: 450,
  damping: 30,
  mass: 3,
};

const UIFootNote = styled.footer`
  font-size: 0.8rem;
  align-self: flex-start;
`;

const SUPERELLIPSE_NAMED_VALUES = {
  square: Infinity,
  squircle: 2,
  round: 1,
  bevel: 0,
  scoop: -1,
  notch: -Infinity,
};

function getSuperEllipseNameMaybe(roundness: number) {
  for (const [name, value] of Object.entries(SUPERELLIPSE_NAMED_VALUES)) {
    if (roundness === value) {
      return name;
    }
  }
  return null;
}

const SuggestionsHolder = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export function App() {
  const cardRef = useRef<HTMLDivElement>(null);

  const $targetBorderRadius = useBox(50);
  const $roundness = useBox(SUPERELLIPSE_NAMED_VALUES.squircle);

  useLayoutEffect(() => {
    const card = cardRef.current;

    if (!card) return;

    const borderRadiusSpring = new AutoNumberSpring(
      $targetBorderRadius.get(),
      SPRING_CONFIG,
      window,
      true
    );

    const roundnessSpring = new AutoNumberSpring(
      $roundness.get(),
      SPRING_CONFIG,
      window,
      true
    );

    const cleanup = createCleanup();

    cleanup.next = autorun(() => {
      borderRadiusSpring.setTargetValue($targetBorderRadius.get());
    });

    cleanup.next = autorun(() => {
      let roundness = $roundness.get();
      if (roundness === -Infinity) {
        roundnessSpring.snapToTarget(-10);
      } else if (roundness === Infinity) {
        roundnessSpring.snapToTarget(10);
      } else {
        roundnessSpring.setTargetValue(roundness);
      }
    });

    cleanup.next = autorun(() => {
      const borderRadius = borderRadiusSpring.value;
      const roundness = roundnessSpring.value;
      card.style.borderRadius = `${borderRadius}%`;
      // @ts-ignore
      card.style.cornerShape = `superellipse(${roundness})`;
    });

    return cleanup;
  }, []);
  return (
    <Shell>
      <Analytics />
      <CardHolder>
        <Card ref={cardRef} />
        <Options>
          <NumberSlider
            $value={$targetBorderRadius}
            min={0}
            max={50}
            step={0.1}
            renderPreview={(value) => {
              const percentage = value / (CARD_HEIGHT / 2);

              return `border-radius: ${value.toFixed(0)}%;`;
            }}
          />
          <NumberSlider
            $value={$roundness}
            min={-2}
            max={3}
            step={0.01}
            renderPreview={(value) => {
              const name = getSuperEllipseNameMaybe(value);
              if (name) {
                return `corner-shape: ${name};`;
              }

              return `corner-shape: superellipse(${value});`;
            }}
          />
          <SuggestionsHolder>
            {Object.entries(SUPERELLIPSE_NAMED_VALUES).map(([name, value]) => (
              <SuggestionButton
                key={name}
                onClick={() => $roundness.set(value)}
              >
                {name}
              </SuggestionButton>
            ))}
          </SuggestionsHolder>
        </Options>
      </CardHolder>
      <UIFootNote>
        <p>
          Created by{" "}
          <a href="https://x.com/pie6k" target="_blank">
            pie6k
          </a>{" "}
          from{" "}
          <a
            href="https://screen.studio?utm_source=squirclestyle"
            target="_blank"
          >
            Screen Studio
          </a>
          . Give it a star on{" "}
          <a href="https://github.com/pie6k/squirclestyle" target="_blank">
            GitHub
          </a>
          .
        </p>
      </UIFootNote>
    </Shell>
  );
}
