package br.com.sorveteria.store.infrastructure;

import br.com.sorveteria.store.domain.StoreConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreRepository extends JpaRepository<StoreConfiguration, Short> { }
