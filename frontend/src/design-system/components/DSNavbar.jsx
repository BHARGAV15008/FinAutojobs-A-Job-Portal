import React, { useEffect, useState } from "react";
import DSContainer from "./DSContainer";
import DSButton from "./DSButton";

export default function DSNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <DSContainer className="flex items-center justify-between h-16">
        <a
          href="/"
          className="flex items-center gap-2 font-semibold text-foreground ds-focus-ring rounded-md px-1"
        >
          <span
            className="inline-block h-6 w-6 rounded-md"
            style={{ background: "var(--brand-gradient-primary)" }}
            aria-hidden
          ></span>
          FinAutoJobs
        </a>
        <nav className="hidden md:flex items-center gap-6 text-sm text-foreground/80">
          <a className="nav-link" href="/jobs">
            Jobs
          </a>
          <a className="nav-link" href="/companies">
            Companies
          </a>
          {/* <a className="nav-link" href="/salary-insights">Salary</a> */}
          <a className="nav-link" href="/resume">
            Resume
          </a>
        </nav>
        <div className="hidden md:flex items-center gap-2">
          <DSButton variant="ghost" as="a" href="/login">
            Login
          </DSButton>
          <DSButton as="a" href="/post-job">
            Post a Job
          </DSButton>
        </div>
        <button
          aria-label="Open menu"
          className="md:hidden ds-focus-ring rounded-md p-2"
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </DSContainer>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <DSContainer className="py-3 flex flex-col gap-2">
            <a className="nav-link" href="/jobs">
              Jobs
            </a>
            <a className="nav-link" href="/companies">
              Companies
            </a>
            {/* <a className="nav-link" href="/salary-insights">Salary</a> */}
            <a className="nav-link" href="/resume">
              Resume
            </a>
            <div className="pt-2 flex gap-2">
              <DSButton variant="ghost" as="a" href="/login" className="flex-1">
                Login
              </DSButton>
              <DSButton as="a" href="/post-job" className="flex-1">
                Post a Job
              </DSButton>
            </div>
          </DSContainer>
        </div>
      )}
    </header>
  );
}
