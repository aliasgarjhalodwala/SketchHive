"use client";

import {
	OrganizationSwitcher,
	useOrganization,
	UserButton,
} from "@clerk/nextjs";
import SearchInput from "./search-input";
import InviteButton from "./invite-button";

const Navbar = () => {
	const { organization } = useOrganization();

	return (
		<div className="flex items-center gap-x-4 m-4">
			<div className="hidden lg:flex lg:flex-1">
				<SearchInput />
			</div>
			<div className="block lg:hidden flex-1">
				<OrganizationSwitcher
					hidePersonal
					appearance={{
						elements: {
							rootBox: {
								width: "100%",
								maxWidth: "376px",
							},
							organizationSwitcherTrigger: {
								width: "90%",
								padding: "6px",
								border: "1px solid #E5E7EB",
								justifyContent: "space-between",
							},
							organizationPreview__organizationSwitcherTrigger: {
								width: "100%",
							},
						},
					}}
				/>
			</div>
			{organization && <InviteButton />}
			<UserButton />
		</div>
	);
};
export default Navbar;
