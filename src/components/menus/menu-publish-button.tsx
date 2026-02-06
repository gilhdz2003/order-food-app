/**
 * Menu Publish/Unpublish Button Component
 *
 * Client component for toggling menu publication status
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { publishMenu, unpublishMenu } from '@/lib/supabase/actions';
import { useRouter } from 'next/navigation';

interface MenuPublishButtonProps {
  menuId: string;
  isPublished: boolean;
}

export function MenuPublishButton({ menuId, isPublished }: MenuPublishButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const result = isPublished
        ? await unpublishMenu(menuId)
        : await publishMenu(menuId);

      if (result.error) {
        alert(`Error: ${result.error}`);
      } else {
        // Refresh the page to show updated status
        router.refresh();
      }
    } catch (error) {
      alert('Error al cambiar el estado del menú');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={isPublished ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? 'Procesando...' : isPublished ? 'Despublicar' : 'Publicar'}
    </Button>
  );
}
