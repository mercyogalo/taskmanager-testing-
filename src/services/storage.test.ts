import { describe, expect, test, beforeEach } from 'vitest';
import { createUser, findUserByEmail } from './storage';


describe('findUserByEmail', ()=>{
    beforeEach(()=>{
        localStorage.clear();
    })

    test('should return the user object if a user with the given email exists',()=>{
        createUser({ id: '1', email:'test@example.com', password:'password123'});
        const user=findUserByEmail('test@example.com');
        expect(user?.email).toBe('test@example.com');
    })
    
    test('should return undefined if no users are stored',()=>{
        const user=findUserByEmail('mercy@example.com');
        expect(user).toBe(undefined);
    })

    
})