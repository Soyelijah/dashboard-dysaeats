import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../entities/event.entity';
import { Snapshot } from '../entities/snapshot.entity';
import { SaveEventDto } from '../dto/save-event.dto';
import { SaveSnapshotDto } from '../dto/save-snapshot.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EventStoreService {
  private readonly logger = new Logger(EventStoreService.name);
  private snapshotFrequency: Record<string, number> = {
    'Order': 20,
    'Restaurant': 10,
    'User': 50,
    'Menu': 15,
    'Delivery': 10,
    'Payment': 20,
  };

  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Snapshot)
    private snapshotRepository: Repository<Snapshot>,
    private eventEmitter: EventEmitter2,
  ) {}

  async saveEvent(saveEventDto: SaveEventDto): Promise<Event> {
    const event = this.eventRepository.create(saveEventDto);
    const savedEvent = await this.eventRepository.save(event);

    // Emit the event for real-time updates
    this.eventEmitter.emit(savedEvent.type, savedEvent);
    this.eventEmitter.emit(`${savedEvent.aggregate_type}:${savedEvent.aggregate_id}`, savedEvent);

    // Check if we need to create a snapshot
    const aggregateType = savedEvent.aggregate_type;
    const frequency = this.snapshotFrequency[aggregateType] || 10;

    if (savedEvent.version % frequency === 0) {
      // Get current state for the aggregate
      const state = await this.getAggregateState(aggregateType, savedEvent.aggregate_id);
      if (state) {
        await this.saveSnapshot({
          aggregate_type: aggregateType,
          aggregate_id: savedEvent.aggregate_id,
          state,
          version: savedEvent.version,
        });
      }
    }

    return savedEvent;
  }

  async getEvents(
    aggregateType: string,
    aggregateId: string,
    fromVersion: number = 0,
  ): Promise<Event[]> {
    let query = this.eventRepository
      .createQueryBuilder('event')
      .where('event.aggregate_type = :aggregateType', { aggregateType })
      .andWhere('event.aggregate_id = :aggregateId', { aggregateId })
      .orderBy('event.version', 'ASC');
    
    if (fromVersion > 0) {
      query = query.andWhere('event.version >= :fromVersion', { fromVersion });
    }
    
    return query.getMany();
  }

  async getLatestVersion(
    aggregateType: string,
    aggregateId: string,
  ): Promise<number> {
    const latestEvent = await this.eventRepository
      .createQueryBuilder('event')
      .where('event.aggregate_type = :aggregateType', { aggregateType })
      .andWhere('event.aggregate_id = :aggregateId', { aggregateId })
      .orderBy('event.version', 'DESC')
      .getOne();

    return latestEvent ? latestEvent.version : 0;
  }

  async getLatestSnapshot(
    aggregateType: string,
    aggregateId: string,
  ): Promise<Snapshot | null> {
    return this.snapshotRepository
      .createQueryBuilder('snapshot')
      .where('snapshot.aggregate_type = :aggregateType', { aggregateType })
      .andWhere('snapshot.aggregate_id = :aggregateId', { aggregateId })
      .orderBy('snapshot.version', 'DESC')
      .getOne();
  }

  async saveSnapshot(saveSnapshotDto: SaveSnapshotDto): Promise<Snapshot> {
    const snapshot = this.snapshotRepository.create(saveSnapshotDto);
    return this.snapshotRepository.save(snapshot);
  }

  /**
   * Delete an event by ID
   * @param id - The event ID to delete
   * @returns true if the event was deleted successfully
   */
  async deleteEvent(id: string): Promise<boolean> {
    try {
      const result = await this.eventRepository.delete(id);
      
      if (result.affected === 0) {
        this.logger.warn(`No event found with ID ${id} to delete`);
        return false;
      }
      
      // Emit an event to notify subscribers about the deletion
      this.eventEmitter.emit('event.deleted', { id });
      
      this.logger.log(`Event with ID ${id} was deleted successfully`);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting event with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get an event by ID
   * @param id - The event ID to find
   * @returns The event or null if not found
   */
  async getEventById(id: string): Promise<Event | null> {
    return this.eventRepository.findOneBy({ id });
  }

  /**
   * Find all events with optional filtering
   * @param filters - Optional filters for type, date range, etc.
   * @returns Array of events matching the filters
   */
  async findAll(filters?: {
    type?: string;
    aggregateType?: string;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
  }): Promise<Event[]> {
    let query = this.eventRepository.createQueryBuilder('event');
    
    if (filters?.type) {
      query = query.andWhere('event.type = :type', { type: filters.type });
    }
    
    if (filters?.aggregateType) {
      query = query.andWhere('event.aggregate_type = :aggregateType', { 
        aggregateType: filters.aggregateType 
      });
    }
    
    if (filters?.fromDate) {
      query = query.andWhere('event.created_at >= :fromDate', { 
        fromDate: filters.fromDate 
      });
    }
    
    if (filters?.toDate) {
      query = query.andWhere('event.created_at <= :toDate', { 
        toDate: filters.toDate 
      });
    }
    
    query = query.orderBy('event.created_at', 'DESC');
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    return query.getMany();
  }

  /**
   * Get unique event types
   * @returns Array of unique event types
   */
  async getEventTypes(): Promise<string[]> {
    const result = await this.eventRepository
      .createQueryBuilder('event')
      .select('DISTINCT event.type', 'type')
      .getRawMany();
    
    return result.map(item => item.type);
  }

  // Helper method to get aggregate state (would be implemented differently for each aggregate type)
  private async getAggregateState(
    aggregateType: string,
    aggregateId: string,
  ): Promise<Record<string, any> | null> {
    // In a real implementation, this would use the appropriate aggregate class
    // to rebuild the state from events. For now, we'll return null as a placeholder.
    return null;
  }
}