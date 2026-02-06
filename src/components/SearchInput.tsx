import type { FC } from 'react';
import type { SearchInputProps } from '@interfaces/SearchInputProps';

export const SearchInput: FC<SearchInputProps> = ({ value, onChange }) => (
	<div className="mb-8">
		<label
			htmlFor="pokemon-search"
			className="mb-3 block text-[0.7rem] font-semibold uppercase tracking-[1.5px] text-poke-secondary"
		>
			Search Pokémon
		</label>
		<div className="group relative">
			<span
				className="duration-250 pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-lg text-poke-muted transition-colors group-focus-within:text-poke-red"
				aria-hidden="true"
			>
				🔍
			</span>
			<input
				id="pokemon-search"
				type="text"
				className="w-full py-3.5 pr-5 pl-14 text-[0.95rem] font-medium text-white bg-poke-input border-2 border-white/[0.08] rounded-[14px] outline-none shadow-[0_2px_8px_rgba(0,0,0,0.25)] placeholder:text-poke-muted placeholder:font-normal hover:border-white/[0.12] hover:bg-[#141430] focus:border-poke-red focus:bg-[#161434] focus:shadow-[0_0_0_4px_rgba(233,69,96,0.12),0_4px_16px_rgba(0,0,0,0.3)] transition-all duration-250 max-sm:text-base"
				placeholder="e.g. pikachu, char, bul…"
				value={value}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
				autoComplete="off"
				spellCheck={false}
				aria-label="Search Pokémon by name"
			/>
		</div>
	</div>
);
