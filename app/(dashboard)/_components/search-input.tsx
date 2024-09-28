"use client";

import { ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import queryString from "query-string";
import { useDebounceValue } from "usehooks-ts";

import { Input } from "@/components/ui/input";

const SearchInput = () => {
	const router = useRouter();
	const value = "";
	const [debouncedValue, setValue] = useDebounceValue(value, 500);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value);
	};

	useEffect(() => {
		const url = queryString.stringifyUrl(
			{
				url: "/",
				query: {
					search: debouncedValue,
				},
			},
			{
				skipEmptyString: true,
				skipNull: true,
			}
		);

		router.push(url);
	}, [debouncedValue, router]);

	return (
		<div className="w-full relative">
			<Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
			<Input
				className="w-full max-w-[516px] pl-9"
				placeholder="Search boards"
				onChange={handleChange}
				defaultValue={value}
			/>
		</div>
	);
};
export default SearchInput;
