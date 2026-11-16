"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  value: string;
  label: string;
  keywords?: string[];
  disabled?: boolean;
}

export interface ComboboxProps
  extends Omit<ButtonProps, "value" | "onChange" | "children" | "variant"> {
  options: readonly ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  (
    {
      options,
      value,
      onValueChange,
      placeholder = "Select an option…",
      searchPlaceholder = "Search options…",
      emptyMessage = "No options found.",
      className,
      name,
      disabled,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const selectedOption = options.find((option) => option.value === value);

    React.useEffect(() => {
      if (disabled) setOpen(false);
    }, [disabled]);

    return (
      <Popover open={open} onOpenChange={setOpen} modal>
        {name && <input type="hidden" name={name} value={value} disabled={disabled} />}
        <PopoverTrigger asChild>
          <Button
            {...props}
            ref={ref}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full min-w-0 justify-between px-3 font-normal aria-[invalid=true]:border-status-danger-fg",
              className,
            )}
            onKeyDown={(event) => {
              onKeyDown?.(event);
              if (
                !event.defaultPrevented &&
                (event.key === "ArrowDown" || event.key === "ArrowUp")
              ) {
                event.preventDefault();
                setOpen(true);
              }
            }}
          >
            <span className={cn("min-w-0 truncate text-left", !value && "text-muted-foreground")}>
              {selectedOption?.label || placeholder}
            </span>
            <ChevronsUpDown className="shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-52 max-w-[calc(100vw-1.5rem)] p-0">
          <Command
            loop
            defaultValue={selectedOption ? selectedOption.value || "combobox-empty-option" : undefined}
          >
            <CommandInput
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
            />
            <CommandList
              aria-label={props["aria-label"] || placeholder}
              style={{
                maxHeight: "min(288px, calc(var(--radix-popover-content-available-height) - 3rem))",
              }}
            >
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value || "combobox-empty-option"}
                    keywords={[option.label, ...(option.keywords || [])]}
                    disabled={option.disabled}
                    onSelect={() => {
                      onValueChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      aria-hidden="true"
                      className={cn(value === option.value ? "opacity-100" : "opacity-0")}
                    />
                    <span className="min-w-0 flex-1 whitespace-normal break-words">
                      {option.label}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);
Combobox.displayName = "Combobox";
