'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type AccountOption = {
  id: string;
  username: string;
  displayName: string | null;
  profileImageUrl: string | null;
};

type AccountSelectorProps = {
  accounts: AccountOption[];
  selected: string;
  onChange: (accountId: string) => void;
};

export function AccountSelector({ accounts, selected, onChange }: AccountSelectorProps) {
  const selectedAccount = accounts.find((acc) => acc.id === selected);

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="account-select" className="text-sm font-medium">
        Conta:
      </label>
      <Select value={selected} onValueChange={onChange}>
        <SelectTrigger id="account-select" className="w-[280px]">
          <SelectValue>
            {selectedAccount ? (
              <div className="flex items-center gap-2">
                {selectedAccount.profileImageUrl && (
                  <img
                    src={selectedAccount.profileImageUrl}
                    alt={selectedAccount.username}
                    className="h-5 w-5 rounded-full"
                  />
                )}
                <span className="font-medium">@{selectedAccount.username}</span>
              </div>
            ) : (
              'Selecione uma conta'
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              <div className="flex items-center gap-2">
                {account.profileImageUrl && (
                  <img
                    src={account.profileImageUrl}
                    alt={account.username}
                    className="h-5 w-5 rounded-full"
                  />
                )}
                <span>@{account.username}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
