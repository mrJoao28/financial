"use client";


import countryList from "react-select-country-list";
import { Check, ChevronsUpDown } from "lucide-react";
import {Control, Controller, FieldValues, Path,} from "react-hook-form";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";


interface CountrySelectProps<T extends FieldValues> {
    control: Control<T>;

    name: Path<T>;
    label?: string;
    required?: boolean;
}

const countries = countryList().getData();

function countryFlag(code: string) {
    return code
        .toUpperCase()
        .replace(/./g, (char) =>
            String.fromCodePoint(127397 + char.charCodeAt(0))
        );
}

export default function CountrySelectorField<T extends FieldValues>({
                                          control,
                                          name,
                                          label = "Country",
                                          required = false,
                                      }: CountrySelectProps<T>) {
    return (
        <Controller
            control={control}
            name={name}
            rules={{
                required: required ? `${label} is required.` : false,
            }}
            render={({ field, fieldState }) => {
                const selected = countries.find(
                    (country) => country.value === field.value
                );

                return (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            {label}
                        </label>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        "country-select-trigger",
                                        !field.value && "text-muted-foreground"
                                    )}
                                >
                                    {selected ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">
                                                {countryFlag(selected.value)}
                                            </span>

                                            <span>{selected.label}</span>
                                        </div>
                                    ) : (
                                        "Select a country"
                                    )}


                                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent
                                className="country-select-content"
                                align="start"
                            >
                                <Command  className="country-select-command">
                                    <CommandInput placeholder="Search country..." className="country-select-input" />

                                    <CommandEmpty className="country-select-empty">
                                        No country found.
                                    </CommandEmpty>

                                    <CommandGroup className="country-select-group">
                                        {countries.map((country) => (
                                            <CommandItem
                                                key={country.value}
                                                value={country.label}
                                                onSelect={() =>
                                                    field.onChange(country.value)
                                                }
                                                className="country-select-item"
                                            >
                                                <span className="mr-3 text-xl">
                                                    {countryFlag(country.value)}
                                                </span>

                                                <span className="flex-1">
                                                    {country.label}
                                                </span>

                                                <Check
                                                    className={cn(
                                                        "ml-auto h-4 w-4",
                                                        field.value ===
                                                        country.value
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                    )}
                                                />
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        {fieldState.error && (
                            <p className="text-sm text-red-500">
                                {fieldState.error.message}
                            </p>
                        )}
                    </div>
                );
            }}
        />
    );
}