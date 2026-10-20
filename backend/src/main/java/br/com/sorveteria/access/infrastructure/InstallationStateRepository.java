package br.com.sorveteria.access.infrastructure;

import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

public interface InstallationStateRepository extends JpaRepository<InstallationState, Short> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select state from InstallationState state where state.id = 1")
    Optional<InstallationState> lockSingleton();
}

