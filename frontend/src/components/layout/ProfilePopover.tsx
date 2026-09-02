"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../auth/AuthProvider";
import { useRouter } from "next/navigation";

interface ProfilePopoverProps {
  avatarUrl?: string;
  profileName: string;
  initials: string;
  avatarFailed: boolean;
}

export default function ProfilePopover({ avatarUrl, profileName, initials, avatarFailed }: ProfilePopoverProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [failedImage, setFailedImage] = useState(avatarFailed);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  async function handleLogout() {
    await signOut();
    setIsOpen(false);
    router.replace("/");
  }

  return (
    <div className="profile-popover-container">
      <button
        ref={buttonRef}
        className="profile-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open profile menu"
      >
        {avatarUrl && !failedImage ? (
          <img 
            className="popover-avatar" 
            src={avatarUrl} 
            alt={profileName}
            onError={() => setFailedImage(true)}
          />
        ) : (
          <span className="popover-avatar">{initials}</span>
        )}
      </button>

      {isOpen && (
        <div ref={popoverRef} className="profile-popover">
          <div className="popover-header">
            {avatarUrl && !failedImage ? (
              <img 
                className="popover-avatar-lg" 
                src={avatarUrl} 
                alt={profileName}
                onError={() => setFailedImage(true)}
              />
            ) : (
              <span className="popover-avatar-lg">{initials}</span>
            )}
            <div className="popover-info">
              <strong>{profileName}</strong>
              <small>{user?.email}</small>
            </div>
          </div>

          <nav className="popover-nav">
            <Link href="/settings" onClick={() => setIsOpen(false)}>
              <span>⚙</span>
              Settings
            </Link>
          </nav>

          <button className="popover-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
