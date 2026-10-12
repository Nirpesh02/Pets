import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from '../hooks/useAuth';
import { petProfileApi } from '../api/petProfileApi';

const PetContext = createContext(null);

export const PetProvider = ({ children }) => {
  const [pets, setPets] = useState([]);
  const [activePetId, setActivePetIdState] = useState(null);
  const toast = useToast();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch user pets from backend API
      petProfileApi
        .getPetProfiles(user.id || user._id)
        .then((data) => {
          if (Array.isArray(data)) {
            setPets(data);
            if (data.length > 0) {
              setActivePetIdState(data[0]._id || data[0].id);
            } else {
              setActivePetIdState(null);
            }
          } else {
            setPets([]);
            setActivePetIdState(null);
          }
        })
        .catch((err) => {
          console.warn('Backend pets fetch info:', err.message);
          setPets([]);
          setActivePetIdState(null);
        });
    } else {
      setPets([]);
      setActivePetIdState(null);
    }
  }, [isAuthenticated, user]);

  const activePet =
    pets.find((p) => (p._id || p.id) === activePetId) || pets[0] || null;

  const setActivePet = (id) => {
    setActivePetIdState(id);
    const pet = pets.find((p) => (p._id || p.id) === id);
    if (pet) {
      toast.info(`Switched active pet to ${pet.name} 🐾`);
    }
  };

  const addPet = async (petData) => {
    try {
      const created = await petProfileApi.createPetProfile(petData);
      const newPet = created || {
        ...petData,
        id: `pet-${Date.now()}`,
        _id: `pet-${Date.now()}`,
      };
      setPets((prev) => [...prev, newPet]);
      setActivePetIdState(newPet._id || newPet.id);
      toast.success(`Welcome to the family, ${newPet.name}! ❤️`);
      return newPet;
    } catch {
      toast.error('Could not save pet profile.');
    }
  };

  const updatePet = async (id, petData) => {
    try {
      const updated = await petProfileApi.updatePetProfile(id, petData);
      setPets((prev) =>
        prev.map((p) => ((p._id || p.id) === id ? { ...p, ...petData } : p))
      );
      toast.success('Pet profile updated!');
      return updated;
    } catch {
      toast.error('Could not update pet profile.');
    }
  };

  const deletePet = async (id) => {
    try {
      await petProfileApi.deletePetProfile(id);
      setPets((prev) => {
        const next = prev.filter((p) => (p._id || p.id) !== id);
        if (activePetId === id && next.length > 0) {
          setActivePetIdState(next[0]._id || next[0].id);
        }
        return next;
      });
      toast.info('Pet profile deleted.');
    } catch {
      toast.error('Could not delete pet.');
    }
  };

  return (
    <PetContext.Provider
      value={{
        pets,
        activePet,
        activePetId,
        setActivePet,
        addPet,
        updatePet,
        deletePet,
      }}
    >
      {children}
    </PetContext.Provider>
  );
};

export const usePet = () => {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error('usePet must be used within a PetProvider');
  }
  return context;
};

export default PetContext;
