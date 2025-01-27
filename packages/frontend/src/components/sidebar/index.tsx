'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import { ChatList } from '@/components/chat/chat-list';
import { Loading } from '@/components/loading';
import { Markdown } from '@/components/markdown';
import { showModal } from '@/components/ui-lib';
import { usePremiumData } from '@/hooks/data/use-premium';
import { useUserData } from '@/hooks/data/use-user';
import { useSwitchTheme } from '@/hooks/switch-theme';
import AddIcon from '@/icons/add.svg';
import AnnouncementIcon from '@/icons/announcement.svg';
import ChatGptIcon from '@/icons/chatgpt.svg';
import CheckMarkIcon from '@/icons/checkmark.svg';
import PremiumIcon from '@/icons/premium.svg';
import SettingsIcon from '@/icons/settings.svg';
import UserIcon from '@/icons/user.svg';
import Locale from '@/locales';
import { useStore } from '@/store';
import styles from '@/styles/module/home.module.scss';
import { isMobileScreen } from '@/utils/client-utils';

import { IUserData } from 'shared';

/* 修复水合错误 */
const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};

function Premium({ userData }: { userData: IUserData }) {
  const { setShowSideBar } = useStore();
  const { isPremium } = userData;
  const { limitData } = usePremiumData();

  return (
    <Link
      href="/premium"
      onClick={() => {
        setShowSideBar(false);
      }}
      prefetch={true}
      className={styles['link-full']}
    >
      <button className={styles['sidebar-premium']}>
        <div>
          <div className={styles['icon']}>
            {isPremium ? <CheckMarkIcon /> : <PremiumIcon />}
          </div>
          {isPremium ? (
            limitData && (
              <div className={styles['text']}>
                {Locale.Index.PremiumLimit(limitData.times)}
              </div>
            )
          ) : (
            <div className={styles['text']}>{Locale.Index.UpgradePremium}</div>
          )}
        </div>
      </button>
    </Link>
  );
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  const {
    showSideBar,
    setShowSideBar,
    fetcher,
    latestAnnouncementId,
    setLatestAnnouncementId,
    config,
  } = useStore();

  useSWR('/announcement/recent', (url) =>
    fetcher(url)
      .then((res) => res.json())
      .then((res) => res.data)
      .then((latestAnnouncement) => {
        if (latestAnnouncement.id !== latestAnnouncementId) {
          showModal({
            title: latestAnnouncement.title,
            children: <Markdown content={latestAnnouncement.content} />,
          });
          setLatestAnnouncementId(latestAnnouncement.id as number);
        }
      }),
  );

  const { userData } = useUserData();

  const loading = !useHasHydrated();

  useSwitchTheme();

  if (loading) {
    return <Loading />;
  }

  return (
    <div
      className={`${
        config.tightBorder && !isMobileScreen()
          ? styles['tight-container']
          : styles.container
      }`}
    >
      <div
        className={styles.sidebar + ` ${showSideBar && styles['sidebar-show']}`}
      >
        <div className={styles['sidebar-header']}>
          <div className={styles['sidebar-title']}>{Locale.Index.Title}</div>
          {!!process.env.NEXT_PUBLIC_OA && (
            <div className={styles['sidebar-sub-title']}>
              {Locale.Index.SubTitle}
              <span className={styles['sidebar-wechat-oa']}>
                {process.env.NEXT_PUBLIC_OA}
              </span>
            </div>
          )}
          <div className={styles['sidebar-logo']}>
            <ChatGptIcon />
          </div>
        </div>
        <Link
          href="/chat/new"
          onClick={() => setShowSideBar(false)}
          className={styles['link-full']}
          style={{ color: 'inherit', textDecoration: 'inherit' }}
        >
          <button className={styles['sidebar-newbtn']}>
            <div>
              <div className={styles['icon']}>
                <AddIcon />
              </div>
              <div className={styles['text']}>{Locale.Home.NewChat}</div>
            </div>
            <Link
              href="/announcement"
              prefetch={true}
              onClick={() => {
                setShowSideBar(false);
              }}
            >
              <div className={styles['account-announcebtn']}>
                <AnnouncementIcon />
              </div>
            </Link>
          </button>
        </Link>
        <div
          className={styles['sidebar-body']}
          onClick={() => {
            setShowSideBar(false);
          }}
        >
          <ChatList />
        </div>

        <div className={styles['sidebar-tail']}>
          {userData && <Premium userData={userData} />}
          <Link
            href="/profile"
            onClick={() => {
              setShowSideBar(false);
            }}
            style={{ color: 'inherit', textDecoration: 'inherit' }}
            prefetch={true}
            className={styles['link-full']}
          >
            <div className={styles['sidebar-accountbtn']}>
              <div
                className={styles['sidebar-account']}
                onClick={() => {
                  setShowSideBar(false);
                }}
              >
                <div className={styles['avatar']}>
                  <UserIcon />
                </div>
                <div className={styles['account-name']}>
                  {userData?.name ?? 'Username'}
                </div>
              </div>
              <Link
                href="/settings"
                onClick={() => {
                  setShowSideBar(false);
                }}
              >
                <div className={styles['account-settingbtn']}>
                  <SettingsIcon />
                </div>
              </Link>
            </div>
          </Link>
        </div>
      </div>
      <div className={styles['window-content']}>{children}</div>
    </div>
  );
}
