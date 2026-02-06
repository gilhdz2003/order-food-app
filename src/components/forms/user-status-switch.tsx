'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface UserStatusSwitchProps {
  defaultChecked: boolean;
  label: string;
  description: string;
}

export function UserStatusSwitch({ defaultChecked, label, description }: UserStatusSwitchProps) {
  const handleChange = (checked: boolean) => {
    // Update the hidden input value when switch changes
    const hiddenInput = document.getElementById('is_active_hidden') as HTMLInputElement;
    if (hiddenInput) {
      hiddenInput.value = checked ? 'true' : 'false';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="space-y-0.5">
        <Label htmlFor="is_active">{label}</Label>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      <Switch
        id="is_active"
        defaultChecked={defaultChecked}
        onCheckedChange={handleChange}
        className="data-[state=checked]:bg-orange-500"
      />
      <input
        type="hidden"
        id="is_active_hidden"
        name="is_active"
        value={defaultChecked ? 'true' : 'false'}
      />
    </div>
  );
}
