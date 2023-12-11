/**
 * ----------------------------
 *      MAKE API SECURE
 * ----------------------------
 * CONCEPT: 
 * 1. ASSIGN two tokens for each person (access token, refresh token)
 * 2. access token contains: user identification (email, role, etc.) valif for a shorter duration
 *3. refresh token is used: to recreate an access token that was expired
 * 4. if refresh is invalid then logout the user
 * 
 * *
 * 1. jwt 
 * 
 * 
 */