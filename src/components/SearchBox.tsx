import * as React from "react";
import { IoSearch } from "react-icons/io5";
import { cn } from "../utils/cn";

type Props = {
  className?: string;
  value: string;
  placeholder?: string;
  onChange: React.ChangeEventHandler<HTMLInputElement> | undefined;
  onSubmit: React.FormEventHandler<HTMLFormElement> | undefined;
};

export function SearchBox(props: Props) {
  return (
    <form
      className={cn(
        "flex relative items-center justify-center h-10",
        props.className
      )}
      onSubmit={props.onSubmit}
    >
      <input
        type="text"
        className="w-full h-full px-4 py-1 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={props.placeholder ?? "Search for a city..."}
        value={props.value}
        onChange={props.onChange}
      />
      <button
        type="submit"
        className="absolute right-3 text-gray-500 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 cursor-pointer"
      >
        <IoSearch />
      </button>
    </form>
  );
}