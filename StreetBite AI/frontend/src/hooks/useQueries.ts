import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Vendor, UserProfile, MenuItem, Coordinates } from '../backend';
import { toast } from 'sonner';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

// Vendor Queries
export function useGetAllVendors() {
  const { actor, isFetching } = useActor();

  return useQuery<Vendor[]>({
    queryKey: ['vendors'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVendors();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000, // Refetch every 5 seconds for live updates
  });
}

export function useGetLiveVendorLocations() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[string, Coordinates]>>({
    queryKey: ['liveVendorLocations'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLiveVendorLocations();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000, // Refetch every 3 seconds for real-time location updates
  });
}

export function useGetAvailableVendors() {
  const { actor, isFetching } = useActor();

  return useQuery<Vendor[]>({
    queryKey: ['vendors', 'available'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableVendors();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetVendorsByProximity(userCoordinates: Coordinates | null, radius: number) {
  const { actor, isFetching } = useActor();

  return useQuery<Vendor[]>({
    queryKey: ['vendors', 'proximity', userCoordinates, radius],
    queryFn: async () => {
      if (!actor || !userCoordinates) return [];
      return actor.getVendorsByProximity(userCoordinates, radius);
    },
    enabled: !!actor && !isFetching && !!userCoordinates,
  });
}

export function useGetVendorById(vendorId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Vendor | null>({
    queryKey: ['vendor', vendorId],
    queryFn: async () => {
      if (!actor || !vendorId) return null;
      return actor.getVendorById(vendorId);
    },
    enabled: !!actor && !isFetching && !!vendorId,
  });
}

export function useSearchVendorsByName(searchTerm: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Vendor[]>({
    queryKey: ['vendors', 'search', searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm) return [];
      return actor.searchVendorsByName(searchTerm);
    },
    enabled: !!actor && !isFetching && searchTerm.length > 0,
  });
}

// Vendor Mutations
export function useRegisterVendor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      foodType: string;
      coordinates: Coordinates;
      menu: MenuItem[];
      address: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerVendor(
        data.name,
        data.foodType,
        data.coordinates,
        data.menu,
        data.address
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['liveVendorLocations'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to register vendor: ${error.message}`);
    },
  });
}

export function useUpdateVendorLocation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { vendorId: string; coordinates: Coordinates }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateVendorLocation(data.vendorId, data.coordinates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['liveVendorLocations'] });
      toast.success('Location updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update location: ${error.message}`);
    },
  });
}

export function useSetAvailability() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { vendorId: string; available: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setAvailability(data.vendorId, data.available);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Availability updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update availability: ${error.message}`);
    },
  });
}

export function useAddMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { vendorId: string; item: MenuItem }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMenuItem(data.vendorId, data.item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Menu item added');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add menu item: ${error.message}`);
    },
  });
}

export function useVerifyVendor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendorId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.verifyVendor(vendorId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor verified successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to verify vendor: ${error.message}`);
    },
  });
}

// Admin Queries
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
