'use client';

import React, { useState } from 'react';
import Icon from './Icon';
import { useStore } from '@/lib/store';
import { SCOPES } from '@/lib/constants';

const scopeIcon = (scope: string) => (scope === 'self' ? 'i-users' : scope === 'org' ? 'i-globe' : scope === 'branch' ? 'i-building' : 'i-layers');

export default function Login() {
  const s = useStore();
  const [role, setRole] = useState<string | null>(null);
  const [pw, setPw] = useState('demo');
  const [show, setShow] = useState(false);

  const signIn = () => {
    if (!role) return;
    s.login(role);
  };

  return (
    <div className="login">
      <div className="login-top">
        <button className="ibtn" onClick={s.toggleTheme} title="Switch theme">
          <Icon name={s.theme === 'dark' ? 'i-sun' : 'i-moon'} />
        </button>
      </div>

      <div className="login-card">
        <div className="login-brand">
          <div className="login-mark">C</div>
          <div>
            <div className="login-brand-t">CARVERSE</div>
            <div className="login-brand-s">PERFORMANCE</div>
          </div>
        </div>

        <div className="login-h">Sign in to your dashboard</div>
        <div className="login-d">Choose a role to explore the platform as. This is a demo sign-in — every role opens the app exactly as that person would see it.</div>

        <div className="login-lbl">Select a role</div>
        <div className="login-roles">
          {s.roles.map((r) => (
            <button key={r.id} className={`login-role ${role === r.id ? 'on' : ''}`} onClick={() => setRole(r.id)} type="button">
              <span className="login-role-ic">
                <Icon name={scopeIcon(r.scope)} c="ico ico-m" />
              </span>
              <span style={{ minWidth: 0 }}>
                <span className="login-role-t" style={{ display: 'block' }}>{r.label}</span>
                <span className="login-role-s" style={{ display: 'block' }}>{SCOPES[r.scope]}</span>
              </span>
              <span className="login-role-lv">{r.lvl && r.lvl !== '—' ? r.lvl : r.id}</span>
            </button>
          ))}
        </div>

        <div className="login-field">
          <div className="login-lbl" style={{ margin: '0 0 10px' }}>Password</div>
          <div className="login-input-wrap">
            <Icon name="i-lock" c="ico ico-m" />
            <input
              type={show ? 'text' : 'password'}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Enter any password"
              onKeyDown={(e) => e.key === 'Enter' && signIn()}
              aria-label="Password"
            />
            <button className="ibtn" type="button" onClick={() => setShow((v) => !v)} title={show ? 'Hide' : 'Show'}>
              <Icon name={show ? 'i-sun' : 'i-search'} c="ico ico-m" />
            </button>
          </div>
          <div className="login-hint">
            <Icon name="i-info" c="ico ico-s" />
            Demo password is <b>&nbsp;demo&nbsp;</b> — but any password works.
          </div>
        </div>

        <button className="btn btn-p login-go" onClick={signIn} disabled={!role}>
          <Icon name="i-arrow-r" c="ico ico-s" />
          {role ? `Sign in as ${s.roles.find((r) => r.id === role)?.label}` : 'Select a role to continue'}
        </button>

        <div className="login-foot">Demo environment · no real authentication. Roles and scope are display-only until enforced server-side.</div>
      </div>
    </div>
  );
}
