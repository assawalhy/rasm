import { requestRedraw } from "@/stores/sketchStore";
import { createEffect, createSignal } from "solid-js";
import * as ColorPicker from "@components/ui/color-picker";
import * as Popover from "@components/ui/popover";
import { parseColor } from "@ark-ui/solid";
import { css } from "styled-system/css";
import { HStack, Stack } from "styled-system/jsx";
import { IconColorPicker } from "@tabler/icons-solidjs";
import { IconButton } from "@/components/ui/icon-button";
import { CloseButton } from "@/components/ui/close-button";
import { stack } from "styled-system/patterns";

const colorSwatches = ["red", "blue", "purple", "orange", "darkgreen"];

/**
 * XfunctionControls component - Left control for function color
 */
function XfunctionControls(props) {
  const [colorValue, setColorValue] = createSignal(
    props.graphChild.pen.color.toString()
  );

  // Sync color with graph child
  createEffect(() => {
    if (props.graphChild?.pen) {
      const hex = props.graphChild.pen.color.toString();
      setColorValue(hex);
    }
  });

  const handleColorChange = (details) => {
    const colorStr = details.valueAsString;
    if (props.graphChild?.pen) {
      try {
        props.graphChild.pen.color.setColor(colorStr);
        setColorValue(colorStr);
        requestRedraw();
      } catch (e) {
        // Ignore invalid colors
      }
    }
  };

  return (
    <div style={{ "--color": colorValue() }}>
      <Popover.Root>
        <Popover.Trigger>
          <button
            type='button'
            class={css({
              width: "24px",
              height: "24px",
              borderRadius: "md",
              padding: "0",
              border: "2px solid transparent",
              transition: "all 0.2s",
              bg: "var(--color)",
              _hover: {
                transform: "scale(1.1)",
                boxShadow: "md",
              },
            })}
          />
        </Popover.Trigger>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.CloseTrigger>
              <CloseButton size={"sm"} />
            </Popover.CloseTrigger>
            <Popover.Arrow>
              <Popover.ArrowTip />
            </Popover.Arrow>
            <Popover.Body
              class={stack({
                gap: 2,
              })}
            >
              <ColorPicker.Root
                value={parseColor(colorValue())}
                onValueChange={handleColorChange}
                open
              >
                <ColorPicker.Content>
                  <ColorPicker.SwatchGroup>
                    <For each={colorSwatches}>
                      {(color) => (
                        <ColorPicker.SwatchTrigger value={color}>
                          <ColorPicker.Swatch value={color}>
                            <ColorPicker.SwatchIndicator color={"white"}>
                              ✓
                            </ColorPicker.SwatchIndicator>
                          </ColorPicker.Swatch>
                        </ColorPicker.SwatchTrigger>
                      )}
                    </For>
                  </ColorPicker.SwatchGroup>
                  <details>
                    <summary>Pick your color</summary>
                    <div class={stack({ gap: 2, pt: 2 })}>
                      <ColorPicker.FormatSelect />
                      <ColorPicker.Area>
                        <ColorPicker.AreaBackground />
                        <ColorPicker.AreaThumb />
                      </ColorPicker.Area>
                      <HStack>
                        <ColorPicker.EyeDropperTrigger>
                          <IconButton variant={"outline"}>
                            <IconColorPicker />
                          </IconButton>
                        </ColorPicker.EyeDropperTrigger>
                        <Stack width='full'>
                          <ColorPicker.ChannelSlider channel='hue' width='full'>
                            <ColorPicker.ChannelSliderTrack />
                            <ColorPicker.ChannelSliderThumb />
                          </ColorPicker.ChannelSlider>
                          <ColorPicker.ChannelSlider
                            channel='alpha'
                            width='full'
                          >
                            <ColorPicker.TransparencyGrid />
                            <ColorPicker.ChannelSliderTrack />
                            <ColorPicker.ChannelSliderThumb />
                          </ColorPicker.ChannelSlider>
                        </Stack>
                      </HStack>
                      <ColorPicker.View format='rgba'>
                        <ColorPicker.ChannelInput channel='hex' />
                        <ColorPicker.ChannelInput channel='alpha' />
                      </ColorPicker.View>
                      <ColorPicker.View format='hsla'>
                        <ColorPicker.ChannelInput channel='hue' />
                        <ColorPicker.ChannelInput channel='saturation' />
                        <ColorPicker.ChannelInput channel='lightness' />
                      </ColorPicker.View>
                    </div>
                  </details>
                </ColorPicker.Content>
                <ColorPicker.HiddenInput />
              </ColorPicker.Root>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Root>
    </div>
  );
}

// Export as Left control
export default {
  Left: XfunctionControls,
};
