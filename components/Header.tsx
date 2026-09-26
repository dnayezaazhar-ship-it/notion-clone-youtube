"use client";

import {
  SignInButton,
  UserButton,
  useUser,
  Show,
} from "@clerk/nextjs";

import Breadcrumbs from "./Breadcrumbs";

function Header() {
  const { user } = useUser();

  return (
    <div className="flex items-center justify-between p-5">
      {/* Left Side */}
      <div>
        {user && (
          <h1 className="text-xl font-bold">
            {user.firstName}&apos;s Space
          </h1>
        )}
      </div>

      {/* Center */}
      <Breadcrumbs />

      {/* Right Side - Logo / User */}
      <div>
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="rounded-lg bg-black px-4 py-2 text-white">
              Sign In
            </button>
          </SignInButton>
        </Show>

        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </div>
  );
}

export default Header;