import mongoose from 'mongoose'
import { MONGO_URI } from '../config/keys'

export async function connectToDatabase ():Promise<void> {
    console.log('Connecting to MongoDB')
    try {
        await mongoose.connect(MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
        console.log('Successfully connected to MongoDB')
    } catch (err) {
        console.error.bind(err, 'MongoDB error:')
    }
}