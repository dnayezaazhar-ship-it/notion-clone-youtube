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
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 p-3 sm:p-5 md:flex md:justify-between">
      {/* Left Side */}
      <div className="min-w-0">
        {user && (
          <h1 className="truncate text-lg font-bold sm:text-xl">
            {user.firstName}&apos;s Space
          </h1>
        )}
      </div>

      {/* Center */}
      <div className="col-span-2 row-start-2 min-w-0 md:col-span-1 md:row-auto">
        <Breadcrumbs />
      </div>

      {/* Right Side - Logo / User */}
      <div className="justify-self-end">
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="rounded-lg bg-black px-3 py-2 text-sm text-white sm:px-4 sm:text-base">
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